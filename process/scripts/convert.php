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
        $statisticsJson = json_decode(file_get_contents($directory.'/'.$currentCountry.'/'.$currentCity.'.json'),true);
        next($country);

        $outArray = array();
        $outArray['labels'] = array_reverse(array_keys($statisticsJson));
        $dataPoints = array();

        foreach($statisticsJson as $dataPoint)
        {
            $currentPoint = key($statisticsJson);
            next($statisticsJson);
            foreach($dataPoint as $dataItem)
            {
                $currentType = key($dataPoint);
                next($dataPoint);
                $dataPoints[$currentType][] = $dataItem;
            }
        }
        $outArray['datasets'] = array(
            array('label'=> 'Female (cis)', 'data'=> array_reverse(returnData($dataPoints['F'], $outArray['labels'])), 'borderColor'=> '#800080', 'backgroundColor'=> '#800080'),
            array('label'=> 'Male (cis)', 'data'=> array_reverse(returnData($dataPoints['M'], $outArray['labels'])), 'borderColor'=> '#C8C800', 'backgroundColor'=> '#C8C800'),
            array('label'=> 'Female (trans)', 'data'=> array_reverse(returnData($dataPoints['FX'], $outArray['labels'])), 'borderColor'=> '#00A050', 'backgroundColor'=> '#00A050'),
            array('label'=> 'Male (trans)', 'data'=> array_reverse(returnData($dataPoints['MX'], $outArray['labels'])), 'borderColor'=> '#00A050', 'backgroundColor'=> '#00A050'),
            array('label'=> 'Intersex', 'data'=> array_reverse(returnData($dataPoints['X'], $outArray['labels'])), 'borderColor'=> '#00A050', 'backgroundColor'=> '#00A050'),
            array('label'=> 'Non-binary', 'data'=> array_reverse(returnData($dataPoints['NB'], $outArray['labels'])), 'borderColor'=> '#808080', 'backgroundColor'=> '#808080'),
            array('label'=> 'Multiple', 'data'=> array_reverse(returnData($dataPoints['+'], $outArray['labels'])), 'borderColor'=> '#A46440', 'backgroundColor'=> '#A46440'),
            array('label'=> 'Unknown', 'data'=> array_reverse(returnData($dataPoints['?'], $outArray['labels'])), 'borderColor'=> '#808080', 'backgroundColor'=> '#808080'),
            array('label'=> 'Not a person', 'data'=> array_reverse(returnData($dataPoints['-'], $outArray['labels'])), 'borderColor'=> '#DDDDDD', 'backgroundColor'=> '#DDDDDD')
        );

        if (!file_exists($outputDirectory.'/'.$currentCountry) || !is_dir($outputDirectory.'/'.$currentCountry))
        {
            mkdir($outputDirectory.'/'.$currentCountry);
        }

        file_put_contents($outputDirectory.'/'.$currentCountry.'/'.$currentCity.'.json', json_encode($outArray));

    }
    next($cities);
}

function returnData($points, $labels)
{
    $count = count($labels);
    $countPoints = count($points);
    
    if ($count == $countPoints) return $points;
    else
    {
        $newArray = array();
        $diff = $count - $countPoints;
        for ($i = 1; $i <= $diff; $i++) {
            $newArray[]='';
        }
        return array_merge($newArray, $points);
    }
}

?>