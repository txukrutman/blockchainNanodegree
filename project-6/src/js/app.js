App = {
    web3Provider: null,
    contracts: {},
    emptyAddress: "0x0000000000000000000000000000000000000000",
    sku: 0,
    upc: 0,
    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    ownerID: "0x0000000000000000000000000000000000000000",
    originFarmerID: "0x0000000000000000000000000000000000000000",
    originFarmName: null,
    originFarmInformation: null,
    originFarmLatitude: null,
    originFarmLongitude: null,
    productNotes: null,
    productPrice: 0,
    distributorID: "0x0000000000000000000000000000000000000000",
    retailerID: "0x0000000000000000000000000000000000000000",
    consumerID: "0x0000000000000000000000000000000000000000",
    accountID: "0x0000000000000000000000000000000000000000",

    init: async function () {
        App.readForm();
        /// Setup access to blockchain
        return await App.initWeb3();
    },

    readForm: function () {
        App.sku = $("#sku").val();
        App.upc = $("#upc").val();
        App.ownerID = $("#ownerID").val();
        App.originFarmerID = $("#originFarmerID").val();
        App.originFarmName = $("#originFarmName").val();
        App.originFarmInformation = $("#originFarmInformation").val();
        App.originFarmLatitude = $("#originFarmLatitude").val();
        App.originFarmLongitude = $("#originFarmLongitude").val();
        App.productNotes = $("#productNotes").val();
        App.productPrice = $("#productPrice").val();
        App.distributorID = $("#distributorID").val();
        App.retailerID = $("#retailerID").val();
        App.consumerID = $("#consumerID").val();
        App.accountID = $("#accountID").val();

        console.log(
            App.sku,
            App.upc,
            App.ownerID, 
            App.originFarmerID, 
            App.originFarmName, 
            App.originFarmInformation, 
            App.originFarmLatitude, 
            App.originFarmLongitude, 
            App.productNotes, 
            App.productPrice, 
            App.distributorID, 
            App.retailerID, 
            App.consumerID,
            App.accountID
        );
    },

    initWeb3: async function () {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        }

        App.getMetaskAccountID();

        return App.initSupplyChain();
    },

    getMetaskAccountID: function () {
        web3 = new Web3(App.web3Provider);

        // Retrieving accounts
        web3.eth.getAccounts(function(err, res) {
            if (err) {
                console.log('Error:',err);
                return;
            }

            // console.log('getMetaskID:',res);
            var sameAccount = App.metamaskAccountID == res[0];
            App.metamaskAccountID = res[0];
            if (!sameAccount){
                console.log("Account changed! Let's check its role");
                App.setButtonColors();
            }

        })
    },

    initSupplyChain: function () {
        /// Source the truffle compiled smart contracts
        var jsonSupplyChain='../../build/contracts/SupplyChain.json';
        
        /// JSONfy the smart contracts
        $.getJSON(jsonSupplyChain, function(data) {
            console.log('data',data);
            var SupplyChainArtifact = data;
            App.contracts.SupplyChain = TruffleContract(SupplyChainArtifact);
            App.contracts.SupplyChain.setProvider(App.web3Provider);
            
            App.fetchItemBufferOne();
            App.fetchItemBufferTwo();
            App.fetchEvents();

        });

        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', App.handleButtonClick);
        $(document).on('focus', App.setButtonColors);
    },

    handleButtonClick: async function(event) {
        event.preventDefault();

        App.getMetaskAccountID();

        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        switch(processId) {
            case 1:
                return await App.harvestItem(event);
                break;
            case 2:
                return await App.processItem(event);
                break;
            case 3:
                return await App.packItem(event);
                break;
            case 4:
                return await App.sellItem(event);
                break;
            case 5:
                return await App.buyItem(event);
                break;
            case 6:
                return await App.shipItem(event);
                break;
            case 7:
                return await App.receiveItem(event);
                break;
            case 8:
                return await App.purchaseItem(event);
                break;
            case 9:
                return await App.fetchItemBufferOne(event);
                break;
            case 10:
                return await App.fetchItemBufferTwo(event);
                break;
            case 11:
                return await App.addFarmer(event);
                break;
            case 12:
                return await App.addDistributor(event);
                break;
            case 13:
                return await App.addRetailer(event);
                break;
            case 14:
                return await App.addConsumer(event);
                break;
            }
    },

    harvestItem: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        App.readForm();

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.harvestItem(
                App.upc, 
                App.metamaskAccountID, 
                App.originFarmName, 
                App.originFarmInformation, 
                App.originFarmLatitude, 
                App.originFarmLongitude, 
                App.productNotes
            );
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('harvestItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    processItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.processItem(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('processItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },
    
    packItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.packItem(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('packItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    sellItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            const productPrice = web3.toWei(1, "ether");
            console.log('productPrice',productPrice);
            return instance.sellItem(App.upc, App.productPrice, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('sellItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    buyItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            const walletValue = web3.toWei(3, "ether");
            return instance.buyItem(App.upc, {from: App.metamaskAccountID, value: walletValue});
        }).then(function(result) {
            $("#ftc-item").text(result);
            $("#distributorID").val(App.metamaskAccountID);
            console.log('buyItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    shipItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.shipItem(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('shipItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    receiveItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.receiveItem(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            $("#retailerID").val(App.metamaskAccountID);
            console.log('receiveItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    purchaseItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.purchaseItem(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            $("#consumerID").val(App.metamaskAccountID);
            console.log('purchaseItem',result); 
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    fetchItemBufferOne: function () {
    ///   event.preventDefault();
    ///    var processId = parseInt($(event.target).data('id'));
        App.upc = $('#upc').val();
        console.log('upc',App.upc);

        App.contracts.SupplyChain.deployed().then(function(instance) {
          return instance.fetchItemBufferOne(App.upc);
        }).then(function(result) {
          $("#ftc-item").text(result);
          $("#ownerID").val(result[2].toString());
          $("#originFarmerID").val(result[3].toString());
          $("#originFarmName").val(result[4].toString());
          $("#originFarmInformation").val(result[5].toString());
          $("#originFarmLatitude").val(result[6].toString());
          $("#originFarmLongitude").val(result[7].toString());
          console.log('fetchItemBufferOne', result);
        }).catch(function(err) {
          console.log(err.message);
        });
    },

    fetchItemBufferTwo: function () {
    ///    event.preventDefault();
    ///    var processId = parseInt($(event.target).data('id'));
                        
        App.contracts.SupplyChain.deployed().then(function(instance) {
          return instance.fetchItemBufferTwo(App.upc);
        }).then(function(result) {
          $("#productNotes").val(result[3].toString());
          $("#productPrice").val(result[4].toString());
          $("#distributorID").val(result[6].toString());
          $("#retailerID").val(result[7].toString());
          $("#consumerID").val(result[8].toString());
          console.log('fetchItemBufferTwo', result);
        }).catch(function(err) {
          console.log(err.message);
        });
    },

    addFarmer: function () {            
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.accountID = $("#accountID").val();
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.addFarmer(App.accountID, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('addFarmer', result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    addDistributor: function () {            
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.accountID = $("#accountID").val();
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.addDistributor(App.accountID, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('addDistributor', result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    addRetailer: function () {            
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.accountID = $("#accountID").val();
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.addRetailer(App.accountID, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('addRetailer', result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },
    
    addConsumer: function () {            
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        
        App.accountID = $("#accountID").val();
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.addConsumer(App.accountID, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('addConsumer', result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    setButtonColors: function () {
        // event.preventDefault();
        // var processId = parseInt($(event.target).data('id'));
        
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.isOwner({from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            var isOwner = (result.toString() == 'true');
            if (isOwner) {
                $("#buttonHarvest").css("background-color","#00BCD4");
                $("#buttonProcess").css("background-color","#00BCD4");
                $("#buttonPack").css("background-color","#00BCD4");
                $("#buttonSale").css("background-color","#00BCD4");
                $("#buttonBuy").css("background-color","#00BCD4");
                $("#buttonShip").css("background-color","#00BCD4");
                $("#buttonReceive").css("background-color","#00BCD4");
                $("#buttonPurchase").css("background-color","#00BCD4");
                $("#buttonFarmer").css("background-color","#00BCD4");
                $("#buttonDistributor").css("background-color","#00BCD4");
                $("#buttonRetailer").css("background-color","#00BCD4");
                $("#buttonConsumer").css("background-color","#00BCD4");
            } else {
                $("#buttonHarvest").css("background-color","#f44336");
                $("#buttonProcess").css("background-color","#f44336");
                $("#buttonPack").css("background-color","#f44336");
                $("#buttonSale").css("background-color","#f44336");
                $("#buttonBuy").css("background-color","#f44336");
                $("#buttonShip").css("background-color","#f44336");
                $("#buttonReceive").css("background-color","#f44336");
                $("#buttonPurchase").css("background-color","#f44336");
                $("#buttonFarmer").css("background-color","#f44336");
                $("#buttonDistributor").css("background-color","#f44336");
                $("#buttonRetailer").css("background-color","#f44336");
                $("#buttonConsumer").css("background-color","#f44336");
                App.checkRoles();
            }
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    checkRoles: function () {
        var isFarmer = false;
        var isDistributor = false;
        var isRetailer = false;
        var isConsumer = false;
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.isFarmer(App.metamaskAccountID);
        }).then(function(result) {
            $("#ftc-item").text(result);
            isFarmer = (result.toString() == 'true');
            if (isFarmer) {
                $("#buttonHarvest").css("background-color","#00BCD4");
                $("#buttonProcess").css("background-color","#00BCD4");
                $("#buttonPack").css("background-color","#00BCD4");
                $("#buttonSale").css("background-color","#00BCD4");
                $("#buttonFarmer").css("background-color","#00BCD4");
            }
        }).catch(function(err) {
            console.log(err.message);
        });

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.isDistributor(App.metamaskAccountID);
        }).then(function(result) {
            $("#ftc-item").text(result);
            isDistributor = (result.toString() == 'true');
            if (isDistributor) {
                $("#buttonBuy").css("background-color","#00BCD4");
                $("#buttonShip").css("background-color","#00BCD4");
                $("#buttonDistributor").css("background-color","#00BCD4");
            }
        }).catch(function(err) {
            console.log(err.message);
        });
        
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.isRetailer(App.metamaskAccountID);
        }).then(function(result) {
            $("#ftc-item").text(result);
            isRetailer = (result.toString() == 'true');
            if (isRetailer) {
                $("#buttonReceive").css("background-color","#00BCD4");
                $("#buttonRetailer").css("background-color","#00BCD4");
            }
        }).catch(function(err) {
            console.log(err.message);
        });
        
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.isConsumer(App.metamaskAccountID);
        }).then(function(result) {
            $("#ftc-item").text(result);
            isConsumer = (result.toString() == 'true');
            if (isConsumer) {
                $("#buttonPurchase").css("background-color","#00BCD4");
                $("#buttonConsumer").css("background-color","#00BCD4");
            }
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    fetchEvents: function () {
        if (typeof App.contracts.SupplyChain.currentProvider.sendAsync !== "function") {
            App.contracts.SupplyChain.currentProvider.sendAsync = function () {
                return App.contracts.SupplyChain.currentProvider.send.apply(
                App.contracts.SupplyChain.currentProvider,
                    arguments
              );
            };
        }

        App.contracts.SupplyChain.deployed().then(function(instance) {
        var events = instance.allEvents(function(err, log){
          if (!err)
            $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
        });
        }).catch(function(err) {
          console.log(err.message);
        });
        
    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
