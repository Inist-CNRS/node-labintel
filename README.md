# node-labintel

[![Build Status](https://travis-ci.org/Inist-CNRS/node-labintel.svg?branch=master)](https://travis-ci.org/Inist-CNRS/node-labintel)

API written in NodeJS to query CNRS L@bintel

## Installation

```shell
npm install labintel
```


## Usage example

```javascript
var labintel = require('labintel');

labintel.getUniteCNRS('UMR8622', function (err, data) {
  console.log(data);
});
```

Will display this JSON:
```javascript
{
    codeUnite: 'UMR8622',
    labintelUrl: 'https://web-ast.dsi.cnrs.fr/l3c/owa/structure.infos_admin?p_lab=UMR8622&p_origine_appel=un',
    etablissements: ['UNIV PARIS-SUD', 'CNRS'],
    responsables: ['Andre DE LUSTRAC, Directeur',
        '',
        'Daniel-Pierre BOUCHIER, Dir-adj'
    ],
    effectif: {
        total: 245,
        chercheursCNRS: 31,
        chercheursNonCNRS: 56,
        itaCNRS: 21,
        itaNonCNRS: 18,
        nonPermanents: 119
    },
    instituts: ['INSIS (Institut des sciences de l\'ingýnierie et des systýmes)'],
    'Institut(s) secondaire(s) :': ['INP (Institut de physique)'],
    disciplines: ['STIC - Sciences et Technologies de l\'Information et de la Communication (75%)',
        'PHY - Physique (25%)'
    ],
    sections: ['8 - Micro et nanotechnologies, micro et nanosystýmes, photonique, ýlectronique, ýlectromagnýtisme, ýnergie ýlectrique',
        '3 - Matiýre condensýe : structures et propriýtýs ýlectroniques',
        '7 - Sciences de l\'information : traitements, systýmes intýgrýs matýriel-logiciel, robots, commandes, images, contenus, interactions, signaux et langues'
    ],
    delegations: ['04 - Ile-de-France Sud'],
    dateCreation: ['01/01/1998'],
    dateRenouvellement: ['01/01/2015']
}
```
