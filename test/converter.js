var expect    = require("chai").expect;
var parse = require("../controllers/parse.js");

describe("Parse response from VBA server", function(){
  describe("Execute all regex contain in object against passed string", function() {
    it("Survey method with valid response", function(){
      const regexs = {
        methodId: /componentId:(\d*)/,
        samplingMethodDesc: /samplingMethodDesc:"([\s\S]*?)"/,
        disciplineCde: /disciplineCde:"(.*?)"/
      };
      const string = `//isc_RPCResponseStart-->[{isDSResponse:true,invalidateCache:false,status:0,data:[{disciplineCde:"fl",samplingMethodDesc:"Monitoring",componentId:1005368}]}]//isc_RPCResponseEnd`

      const surveyMethod = parse.findAllMatches(regexs, string);
      expect(surveyMethod).to.be.a('object');
    });

    it("Survey method with error response", function(){
      const regexs = {
        methodId: /componentId:(\d*)/,
        samplingMethodDesc: /samplingMethodDesc:"([\s\S]*?)"/,
        disciplineCde: /disciplineCde:"(.*?)"/
      };
      const string = '';

      const surveyMethod = parse.findAllMatches(regexs, string);
      expect(surveyMethod).to.be.false;
    });
  });
}); 