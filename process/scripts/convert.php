<?php

/**
 * Get statistics data for all cities
 */

declare(strict_types=1);

chdir(__DIR__.'/../');

require 'vendor/autoload.php';
require 'scripts/functions/strpos_all.php';

$directory = 'data';
$outputDirectory = '../data';

if (!file_exists($directory) || !is_dir($directory)) {
    throw new ErrorException('No data to convert');
}
if(!file_exists($directory.'/cities.json')) {
    throw new ErrorException('Missing cities.json');
}
if (!file_exists($outputDirectory) || !is_dir($outputDirectory)) {
    mkdir($outputDirectory);
}

$cities = file_get_contents($directory.'/cities.json');
copy($directory.'/cities.json', $outputDirectory.'/cities.json');
$cities = json_decode($cities, true);

foreach ($cities as $country)
{
    
    $currentCountry = key($cities);
    foreach($country as $city)
    {
        $currentCity = key($country);
        $statisticsJson = json_decode(file_get_contents($directory.'/'.$currentCountry.'/'.$currentCity.'-statistics.json'),true);
        array_multisort($statisticsJson, SORT_DESC, SORT_REGULAR);
        $sourcesJson = json_decode(file_get_contents($directory.'/'.$currentCountry.'/'.$currentCity.'-sources.json'), true);
        array_multisort($sourcesJson, SORT_DESC, SORT_REGULAR);
        next($country);

        $statisticsArray = array();

        foreach($statisticsJson as $dataPoint)
        {
            $pointArray = array();
            $currentPoint = key($statisticsJson);
            $pointArray['x'] = $currentPoint;
            next($statisticsJson);
            foreach($dataPoint as $dataItem)
            {
                $currentType = key($dataPoint);
                next($dataPoint);
                $pointArray[$currentType] = $dataItem;
            }
            $statisticsArray[] = $pointArray;
        }

        $sourcesArray = array();

        foreach($sourcesJson as $dataPoint)
        {
            $pointArray = array();
            $currentPoint = key($sourcesJson);
            $pointArray['x'] = $currentPoint;
            next($sourcesJson);
            foreach($dataPoint as $dataItem)
            {
                $currentType = key($dataPoint);
                next($dataPoint);
                $pointArray[$currentType] = $dataItem;
            }
            $sourcesArray[] = $pointArray;
        }

        if (!file_exists($outputDirectory.'/'.$currentCountry) || !is_dir($outputDirectory.'/'.$currentCountry))
        {
            mkdir($outputDirectory.'/'.$currentCountry);
        }

        $outArray = array('statistics' => $statisticsArray, 'sources' => $sourcesArray);
        file_put_contents($outputDirectory.'/'.$currentCountry.'/'.$currentCity.'.json', json_encode($outArray, JSON_PRETTY_PRINT));

    }
    next($cities);
}

?>