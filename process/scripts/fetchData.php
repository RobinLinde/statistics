<?php

/**
 * Get statistics data for all cities
 */

declare(strict_types=1);

chdir(__DIR__.'/../');

require 'vendor/autoload.php';
require 'scripts/functions/strpos_all.php';

$directory = 'data';

if (!file_exists($directory) || !is_dir($directory)) {
    mkdir($directory, 0777, true);
}

$options = getopt('a:');
$api_key = $options['a'];
$api_endpoint = 'https://api.github.com/';

$submodules_raw = get_submodules();

$submodules = parse_submodules($submodules_raw);

foreach ($submodules as $submodule)
{
    $statisticsFile = get_history($submodule['owner'], $submodule['repo'], '/data/statistics.json', $api_key, $api_endpoint);
    $sourcesFile = get_history($submodule['owner'], $submodule['repo'], '/data/sources.json', $api_key, $api_endpoint);
    $metadataFile = get_history($submodule['owner'], $submodule['repo'], '/data/metadata.json', $api_key, $api_endpoint);
    echo "Got data for ".$submodule['repo']."\n";

    if (!empty($metadataFile)){
        $statisticsArray = array();
        $sourcesArray = array();

        foreach($metadataFile as $p=>$d){
            $statisticsArray[$p] = $d['genders'];
            $sourcesArray[$p] = $d['sources'];
        }

        if(!empty($statisticsFile) or !empty($sourcesFile)){
            $statistics = array_merge($statisticsFile, $statisticsArray);
            $sources = array_merge($sourcesFile, $sourcesArray);
            ksort($statistics);
            ksort($sources);
        }
        else {
            $statistics = $statisticsArray;
            $sources = $sourcesArray;
        }
    }
    else {
        $statistics = $statisticsFile;
        $sources = $sourcesFile;
    }

    if (!is_dir($directory.substr(str_replace('cities','', $submodule['path']),0, strpos(str_replace('cities','', $submodule['path']), '/',2))))
    {
        mkdir($directory.substr(str_replace('cities','', $submodule['path']),0, strpos(str_replace('cities','', $submodule['path']), '/',2)));
    }

    file_put_contents($directory.'/'.str_replace('cities/', '', $submodule['path']).'-statistics.json', json_encode($statistics));
    file_put_contents($directory.'/'.str_replace('cities/', '', $submodule['path']).'-sources.json', json_encode($sources));
    
}

file_put_contents($directory.'/cities.json', get_cities());

function get_submodules(): string
{
    $client = new \GuzzleHttp\Client();
    $response = $client->request(
        'GET', 'https://raw.githubusercontent.com/EqualStreetNames/equalstreetnames/master/.gitmodules'
    );

    $status = $response->getStatusCode();

    if ($status !== 200) {
        throw new ErrorException($response->getReasonPhrase());
    }

    return (string) $response->getBody();
}


function parse_submodules(string $submodules): array
{

    $paths_starts = strpos_all($submodules, 'path =');
    $urls_starts = strpos_all($submodules, 'url =');
    $urls_ends = array();

    foreach ($urls_starts as $p)
    {
        $urls_ends[] = strpos($submodules, "[", $p);
    }
    $urls_ends[count($urls_ends)-1] = strlen($submodules);

    $submodules_output = array();

    for($i = 0; $i < count($paths_starts); $i++)
    {
        $path = substr($submodules, $paths_starts[$i]+7, $urls_starts[$i]-$paths_starts[$i]-9);
        $url = substr($submodules, $urls_starts[$i]+6, $urls_ends[$i]-$urls_starts[$i]-7);
        $slashes = strpos_all($url, '/');
        $owner = substr($url, $slashes[count($slashes)-2]+1, $slashes[count($slashes)-1]-$slashes[count($slashes)-2]-1);
        $repo = str_replace('.git', '', substr($url, $slashes[count($slashes)-1]+1));
        $submodules_output[] = array('path' => $path, 'url' => $url, 'owner' => $owner, 'repo' => $repo);
    }

    return $submodules_output;

}

function get_history(string $owner, string $repo, string $file, string $api_key, string $api_endpoint)
{
    $client = new \GuzzleHttp\Client();
    $response = $client->request(
        'GET', $api_endpoint.'repos/'.$owner.'/'.$repo.'/commits?path='.$file,
        ['headers' => [
            'Accept' => 'application/vnd.github.v3+json',
            'Authorization' => 'token '.$api_key
        ]]
    );

    $status = $response->getStatusCode();

    if ($status !== 200) {
        throw new ErrorException($response->getReasonPhrase());
    }

    $commits = (string) $response->getBody();
    $commits = json_decode($commits, true);

    $statistics = array();

    foreach ($commits as $commit)
    {
        $response = $client->request(
            'GET', $api_endpoint.'repos/'.$owner.'/'.$repo.'/contents/'.$file.'?ref='.$commit['sha'],
                ['headers' => [
                    'Accept' => 'application/vnd.github.v3+json',
                    'Authorization' => 'token '.$api_key
                ],
                'http_errors' => false
            ]
        );

        $status = $response->getStatusCode();

        if ($status !== 404)
        {
            if ($status !== 200) {
                throw new ErrorException($response->getReasonPhrase());
            }

            $data = (string) $response->getBody();
            $data = json_decode($data, true);

            $statistics[$commit['commit']['committer']['date']]=json_decode(base64_decode($data['content']), true);
        }

    }

    return $statistics;
}

function get_cities(): string
{
    $client = new \GuzzleHttp\Client();
    $response = $client->request(
        'GET', 'https://raw.githubusercontent.com/EqualStreetNames/equalstreetnames/master/global/cities.json'
    );

    $status = $response->getStatusCode();

    if ($status !== 200) {
        throw new ErrorException($response->getReasonPhrase());
    }

    return (string) $response->getBody();
}

?>