// 
// Uses wget because request and superagent return strange error
//   superagent { [Error: socket hang up] code: 'ECONNRESET', response: undefined } undefined
//   request { [Error: socket hang up] code: 'ECONNRESET' } undefined
// Same as curl :
//   $ curl -v "https://web-ast.dsi.cnrs.fr/l3c/owa/structure.infos_admin?p_lab=UMR3664&p_origine_appel=un"
//   * Hostname was NOT found in DNS cache
//   *   Trying 193.52.36.99...
//   * Connected to web-ast.dsi.cnrs.fr (193.52.36.99) port 443 (#0)
//   * successfully set certificate verify locations:
//   *   CAfile: none
//     CApath: /etc/ssl/certs
//   * SSLv3, TLS handshake, Client hello (1):
//   * SSLv3, TLS handshake, Server hello (2):
//   * SSLv3, TLS handshake, CERT (11):
//   * SSLv3, TLS handshake, Server finished (14):
//   * SSLv3, TLS handshake, Client key exchange (16):
//   * SSLv3, TLS change cipher, Client hello (1):
//   * SSLv3, TLS handshake, Finished (20):
//   * SSLv3, TLS change cipher, Client hello (1):
//   * SSLv3, TLS handshake, Finished (20):
//   * SSL connection using TLSv1.0 / AES256-SHA
//   * Server certificate:
//   *        subject: OU=Domain Control Validated; CN=web-ast.dsi.cnrs.fr
//   *        start date: 2013-10-21 00:00:00 GMT
//   *        expire date: 2016-10-20 23:59:59 GMT
//   *        subjectAltName: web-ast.dsi.cnrs.fr matched
//   *        issuer: C=NL; O=TERENA; CN=TERENA SSL CA
//   *        SSL certificate verify ok.
//   > GET /l3c/owa/structure.infos_admin?p_lab=UMR3664&p_origine_appel=un HTTP/1.1
//   > User-Agent: curl/7.38.0
//   > Host: web-ast.dsi.cnrs.fr
//   > Accept: */*
//   > 
//   * SSLv3, TLS alert, Client hello (1):
//   * Empty reply from server
//   * Connection #0 to host web-ast.dsi.cnrs.fr left intact
//   curl: (52) Empty reply from server
// 

'use strict';

const spawn    = require('child_process').spawn;
const encoding = require('encoding');
const cheerio = require('cheerio');

module.exports.getUniteCNRS = function (codeUnite, cb) {
  let rawOuData = '';
  let rawErr    = '';


  // exemple for title:
  // https://web-ast.dsi.cnrs.fr/l3c/owa/structure.bandeau_infos?p_etat=un&p_pe=0&p_th=0&p_pr=0&p_eq=0&p_pa=0&p_uc=0&p_lab_sel=GDS3378&p_i=0&p_nbres=0&p_num_lab=0

  // example for details:
  // wget --quiet "https://web-ast.dsi.cnrs.fr/l3c/owa/structure.infos_admin?p_lab=UMR3664&p_origine_appel=un" -O -
  const wget = spawn('wget', ['--quiet', 'https://web-ast.dsi.cnrs.fr/l3c/owa/structure.infos_admin?p_lab=' + codeUnite + '&p_origine_appel=un', '-O', '-']);

  wget.stdout.on('data', (data) => {
    rawOuData += data;
  });

  wget.stderr.on('data', (data) => {
    rawErr += data;
  });

  wget.on('close', (code) => {
    if (code === 0) {
      let ouData = { codeUnite: codeUnite, labintelUrl: 'https://web-ast.dsi.cnrs.fr/l3c/owa/structure.infos_admin?p_lab=' + codeUnite + '&p_origine_appel=un' };
      // ISO-8859-1 => UTF-8
      rawOuData = '' + encoding.convert(rawOuData, 'UTF-8', 'ISO-8859-1'); // not working ...

      let $ = cheerio.load(rawOuData, {
        normalizeWhitespace: false,
        decodeEntities: false
      });

      $('ul li').each(function(i, elem) {
        let section = $(elem).find('b').text().trim();
        section = parseOukey(section);
        $(elem).find('b').remove();
        let values = $(this).text().trim().split('\n')
          .map(function (el) {
            return el.trim();
          })
          .filter(function (el) {
            return el != 'Principal&nbsp;:';
          });
        
        if (section == 'effectif') {
          values = parseEffectif(values);
        }

        ouData[section] = values;
      });      

      return cb(null, ouData);
    } else {
      return cb(new Error(rawErr));
    }
  });
}



// Input example:
//   effectif: 
//    [ '42',
//      'Chercheurs CNRS : 7',
//      'Chercheurs non CNRS : 5',
//      'ITA CNRS : 4',
//      'ITA non CNRS : 5',
//      'Non permanents : 21' ],
function parseEffectif(rawEffectif) {
  let result = {};
  result.total = parseInt(rawEffectif[0], 10);
  rawEffectif.shift(); // remove the first value (just an integer)
  rawEffectif.forEach(function (val) {
    val = val.split(' : ');
    switch (val[0]) {
      case 'Chercheurs CNRS':
        result.chercheursCNRS = parseInt(val[1], 10);
        break;
      case 'Chercheurs non CNRS':
        result.chercheursNonCNRS = parseInt(val[1], 10);
        break;
      case 'ITA CNRS':
        result.itaCNRS = parseInt(val[1], 10);
        break;
      case 'ITA non CNRS':
        result.itaNonCNRS = parseInt(val[1], 10);
        break;
      case 'Non permanents':
        result.nonPermanents = parseInt(val[1], 10);
        break;
      default:
        result[val[0]] = parseInt(val[1], 10);
        break;
    }
  });
  return result;
}

function parseOukey(rawOuKey) {
  let result = rawOuKey;
  switch (rawOuKey) {
    case 'Etablissement(s) de rattachement :':
      result = 'etablissements';
      break;
    case 'Responsable(s) :':
      result = 'responsables';
      break;
    case 'Effectif&nbsp;:':
      result = 'effectif';
      break;
    case 'Institut(s) de rattachement :':
      result = 'instituts';
      break;
    case 'Groupe(s) de discipline :':
      result = 'disciplines';
      break;
    case 'Section(s) :':
      result = 'sections';
      break;
    case 'D&eacute;l&eacute;gation(s) :':
      result = 'delegations';
      break;
    case 'Date de cr&eacute;ation :':
      result = 'dateCreation';
      break;
    case 'Date de renouvellement :':
      result = 'dateRenouvellement';
      break;
  }
  return result;
}

