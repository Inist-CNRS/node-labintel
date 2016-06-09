/* global describe, it */
'use strict';
var assert = require('chai').assert
	, path = require('path')
  , labintel = require('..');

describe('the labintel nodejs API', function () {
  
  this.timeout(6000);

  // getUniteCNRS('UPS76', console.log);  
  // getUniteCNRS('UMR7648', console.log);  
  // getUniteCNRS('UMR5292', console.log);  
  // getUniteCNRS('UMR8622', console.log);  
  // getUniteCNRS('UMR5502', console.log);  
  // getUniteCNRS('UMR6251', console.log);  
  // getUniteCNRS('UMR5157', console.log);  
  // getUniteCNRS('GDS3648', console.log);  

  it('should return correct UMR8622 details', function (done) {
    labintel.getUniteCNRS('UMR8622', function (err, data) {
      assert.equal(data.codeUnite, 'UMR8622');
      assert.lengthOf(data.instituts, 1);
      done(err);
    });
  });

});
