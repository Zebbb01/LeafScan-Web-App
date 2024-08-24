import * as React from 'react';
import './Forecast.css'
import { LineChart } from '@mui/x-charts/LineChart';

const cacaoLeafDiseaseData = [
  {
    year: 2000,
    LeafSpot: 120,
    EarlyBlight: 80,
    LateBlight: 50,
  },
  {
    year: 2001,
    LeafSpot: 130,
    EarlyBlight: 85,
    LateBlight: 55,
  },
  {
    year: 2002,
    LeafSpot: 150,
    EarlyBlight: 90,
    LateBlight: 60,
  },
  {
    year: 2003,
    LeafSpot: 140,
    EarlyBlight: 95,
    LateBlight: 65,
  },
  {
    year: 2004,
    LeafSpot: 160,
    EarlyBlight: 100,
    LateBlight: 70,
  },
  {
    year: 2005,
    LeafSpot: 170,
    EarlyBlight: 110,
    LateBlight: 75,
  },
  {
    year: 2006,
    LeafSpot: 180,
    EarlyBlight: 120,
    LateBlight: 80,
  },
  {
    year: 2007,
    LeafSpot: 190,
    EarlyBlight: 130,
    LateBlight: 85,
  },
  {
    year: 2008,
    LeafSpot: 200,
    EarlyBlight: 140,
    LateBlight: 90,
  },
  {
    year: 2009,
    LeafSpot: 210,
    EarlyBlight: 150,
    LateBlight: 95,
  },
  {
    year: 2010,
    LeafSpot: 220,
    EarlyBlight: 160,
    LateBlight: 100,
  },
  {
    year: 2011,
    LeafSpot: 230,
    EarlyBlight: 170,
    LateBlight: 105,
  },
  {
    year: 2012,
    LeafSpot: 240,
    EarlyBlight: 180,
    LateBlight: 110,
  },
  {
    year: 2013,
    LeafSpot: 250,
    EarlyBlight: 190,
    LateBlight: 115,
  },
  {
    year: 2014,
    LeafSpot: 260,
    EarlyBlight: 200,
    LateBlight: 120,
  },
  {
    year: 2015,
    LeafSpot: 270,
    EarlyBlight: 210,
    LateBlight: 125,
  },
  {
    year: 2016,
    LeafSpot: 280,
    EarlyBlight: 220,
    LateBlight: 130,
  },
  {
    year: 2017,
    LeafSpot: 290,
    EarlyBlight: 230,
    LateBlight: 135,
  },
  {
    year: 2018,
    LeafSpot: 300,
    EarlyBlight: 240,
    LateBlight: 140,
  },
  {
    year: 2019,
    LeafSpot: 310,
    EarlyBlight: 250,
    LateBlight: 145,
  },
  {
    year: 2020,
    LeafSpot: 320,
    EarlyBlight: 260,
    LateBlight: 150,
  },
  {
    year: 2021,
    LeafSpot: 330,
    EarlyBlight: 270,
    LateBlight: 155,
  },
  {
    year: 2022,
    LeafSpot: 340,
    EarlyBlight: 280,
    LateBlight: 160,
  },
];

const keyToLabel = {
  LeafSpot: 'Leaf Spot',
  EarlyBlight: 'Early Blight',
  LateBlight: 'Late Blight',
};

const colors = {
  LeafSpot: 'red',
  EarlyBlight: 'green',
  LateBlight: 'purple',
};

const stackStrategy = {
  stack: 'total',
  area: true,
  stackOffset: 'none',
};

const customize = {
  height: 400,
  legend: { hidden: false },
  margin: { top: 5 },
  stackingOrder: 'descending',
};

const CacaoLeafDiseaseForecast = () => {
  return (
    <div className="chart-container">
      <LineChart
        className="line-chart"
        xAxis={[
          {
            dataKey: 'year',
            valueFormatter: (value) => value.toString(),
            min: 2000,
            max: 2022,
          },
        ]}
        series={Object.keys(keyToLabel).map((key) => ({
          dataKey: key,
          label: keyToLabel[key],
          color: colors[key],
          showMark: false,
          ...stackStrategy,
        }))}
        dataset={cacaoLeafDiseaseData}
        {...customize}
      />
    </div>
  );
};

export default CacaoLeafDiseaseForecast;
