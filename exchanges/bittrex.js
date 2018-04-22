const request = require("request-promise");
var tickers = require('./../common/variables').tickers;
var queueBittrex = require('./../common/variables').queueBittrex;

const  Bittrex = {
    getTickers: async function(inizializza) {
        const url =
          "https://bittrex.com/api/v1.1/public/getmarketsummaries";
        return request.get(url, (error, response, body) => {
      
          if (error || response.statusCode != 200) {
            console.log("Errore bittrex");
            return;
          }
      
          let json = JSON.parse(body);
      
          if (!json.success) {
            console.log(json.message);
            return;
          }
          var count = 0;
          json.result.forEach(element => {
            var ticker = tickers.find(x => x.id === element.MarketName);
      
            if (ticker == null && inizializza) // nuovo, lo inserisco
            {
              tickers.push({
                id: element.MarketName,
                bittrex: {
                  last: element.Last,
                  bid: element.Bid,
                  ask: element.Ask,
                },
                liqui: {},
                binance: {},
                poloniex: {},
                cryptopia: {},
                hitbtc: {},
                exmo: {},
                livecoin: {},
                bitfinex: {}
              });
      
            }
            else if (ticker == null) {
              return;
            }
            else {
              ticker.bittrex.last = element.Last;
              ticker.bittrex.bid = element.Bid;
              ticker.bittrex.ask = element.Ask;
            }
      
            count++;
          });
      
          if (inizializza) {
            while (count != json.result.length) { }
          }
          return;
      
        });       
      },
      startDequequeOrderbook: function(){
        setInterval(async function () {
            if (queueBittrex.length > 0) {
              var data = queueBittrex.shift();
              var res = data.res;
              var json = await getOrderBookBittrex(data.funct.market, data.funct.type);
              res.contentType('application/json');
              res.send(JSON.stringify({
                link: "https://bittrex.com/Market/Index?MarketName=" + data.funct.market,
                arr: json,
              }));
            }
          }, 1000);
      }
}


async function getOrderBookBittrex(market, type) {
    
      if (type == "bid") {
        type = "buy";
      }
      else if (type == "ask") {
        type = "sell";
      }
      var data;
      const url =
        "https://bittrex.com/api/v1.1/public/getorderbook?market=" + market + "&type=" + type;
      await request.get(url, (error, response, body) => {
    
        if (error || response.statusCode != 200) {
          console.log("Errore bittrex");
          return [];
        }
    
        let json = JSON.parse(body);
    
        if (!json.success) {
          console.log(json.message);
          data = [];
          return data;
        }
        if (json.result == null) {
          data = [];
          return data;
        }
    
        var dim = (json.result.length - 1 < 10 ? json.result.length - 1 : 10);
        data = json.result.splice(0, dim);
    
      });
    
      return data;
    }


exports.Bittrex = Bittrex;