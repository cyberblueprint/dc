angular.module('app', ["ngRoute"])
.config(function($routeProvider) {
    $routeProvider
    .when("/row", {
        templateUrl : "templates/1row.html",
        controller: 'rowController'
    })
    .when("/pie", {
        templateUrl : "templates/2pie.html",
        controller: 'pieController'
    })
    .when("/line", {
        templateUrl : "templates/3line.html",
        controller: 'lineController'
    })
    .when("/bubble", {
        templateUrl : "templates/4bubble.html",
        controller: 'bubbleController'
    })
    .when("/table", {
        templateUrl : "templates/5table.html",
        controller: 'tableController'
    })
    .when("/rowpie", {
        templateUrl : "templates/6rowpie.html",
        controller: 'rowpieController'
    })
    .when("/rowpieline", {
        templateUrl : "templates/7rowpieline.html",
        controller: 'rowpielineController'
    })
    .when("/rowpielinebubble", {
        templateUrl : "templates/8rowpielinebubble.html",
        controller: 'rowpielinebubbleController'
    })
    .when("/rowpielinebubbletable", {
        templateUrl : "templates/9rowpielinebubbletable.html",
        controller: 'rowpielinebubbletableController'
    })
    .when("/inputoptions", {
        templateUrl : "templates/10inputoptions.html",
        controller: 'inputoptionsController'
    })
    .when("/inputtabs", {
        templateUrl : "templates/11inputtabs.html",
        controller: 'inputtabsController'
    })
    .when("/inputfilter", {
        templateUrl : "templates/12inputfilter.html",
        controller: 'inputfilterController'
    })
    .when("/keyboard", {
        templateUrl : "templates/13keyboard.html",
        controller: 'keyboardController'
    });
})

.controller('mainCtrl', function($scope){
	$scope.todo = function(){
		console.log('Clicked');
	}
})
.controller('rowController', function(){
    var dataset;
    var RowChart = dc.rowChart("#rowchart");


    d3.csv("data/data.csv", function(data) {        
        dataset = data;
        Graph(dataset);         
    });
    

    function Graph(data) {   
        // Make a crossfilter object  
        var ndx = crossfilter(data);
        console.log(data);          

        dim = ndx.dimension(function(d) {return d.type});
        g = dim.group().reduceSum(function(d){return d.legs;});

        RowChart.dimension(dim).group(g).width(500);

        dc.renderAll(); // render all charts on the page
    };
})
.controller('pieController', function(){
    var dataset;
    var PieChart = dc.pieChart("#piechart");

    d3.csv("data/data.csv", function(data) {
        dataset = data;
        Graph(dataset);
    });
        

    function Graph(data) {       
        var ndx = crossfilter(data);
        console.log(data);
        
        dim = ndx.dimension(function(d) {return d.type});
        g = dim.group().reduceSum(function(d){return d.legs;});

        //Lets create a pie chart
        PieChart.dimension(dim).radius(90).innerRadius(45).group(g).title(function(d){ return d.data.key +": "+d.value;}).renderTitle(true);              

        dc.renderAll(); // render all charts on the page
    };
})
.controller('lineController', function() {
    var dataset;
    var LineChart = dc.lineChart("#linechart");


    d3.csv("data/data.csv", function(data) {
        dataset = data;
        Graph(dataset);
    });
        

    function Graph(data) { 
        var ndx = crossfilter(data);
        console.log(data);
        
        dim = ndx.dimension(function(d) {return d.legs});
        g = dim.group().reduceSum(function(d){return d.legs;});

        LineChart.dimension(dim)
                 .group(g)
                 .width(800)
                 .height(200)
                 .yAxisPadding(1.5) // there is also one for the X axis
                 .elasticY(true) // rescale axis to fit data
                 .x(d3.scale.linear().domain([0,g.top(1)[0].value]))
                 .brushOn(false)
                 .dotRadius(10) // radius after hoover over datapoint
                 .renderHorizontalGridLines(true);

        dc.renderAll();
    };
})
.controller('bubbleController', function() {
    var dataset;
    var BubbleChart = dc.bubbleChart("#bubblechart");


    d3.csv("data/data.csv", function(data) {
        data.forEach(function (e) {
            // convert from string to int
            e.hp = +e.hp;
            e.legs = +e.legs;
        }); 
        dataset = data;
        Graph(dataset);
    });
        

    function Graph(data) {
        var ndx = crossfilter(data);
        console.log(data);
        dim = ndx.dimension(function(d) {return d.hp});
        g = dim.group().reduce( 
            //add
            function(p,v) {
                 ++p.count;
                 p.sumIndex +=v.legs;
                 p.avgIndex=p.sumIndex/p.count;
                  return p;
                },
            //remove
            function(p,v) {
                --p.count; 
                 p.sumIndex -=v.legs;
                 p.avgIndex=p.sumIndex/p.count;
                return p;
                },
            //init
            function() {
                return {count:0, sumIndex:0, 
                    avgIndex:0 };
            }
        );
                
        // max and min values       
        var dmax = d3.max(g.all(), function(d) { return d.value.sumIndex; }); 
        var dmin = d3.min(g.all(), function(d) { return d.value.sumIndex; });   

        //Lets create a bubble chart
        BubbleChart.dimension(dim)
                   .width(500) // (optional) define chart width, :default = 200
                   .height(200) // (optional) define chart height, :default = 200
                   .group(g)
                   
                    //##### Accessors
                    //Accessor functions are applied to each value returned by the grouping
                    //
                    //* `.colorAccessor` The returned value will be mapped to an internal scale to determine a fill color
                    //* `.keyAccessor` Identifies the `X` value that will be applied against the `.x()` to identify pixel location
                    //* `.valueAccessor` Identifies the `Y` value that will be applied agains the `.y()` to identify pixel location
                    //* `.radiusValueAccessor` Identifies the value that will be applied agains the `.r()` determine radius size,
                    //*     by default this maps linearly to [0,100]
            
                   .keyAccessor(function (p) { return p.value.sumIndex; }) // x value              
                   .valueAccessor(function(p) {return p.value.sumIndex;}) // y value
                   .radiusValueAccessor(function(p) {return p.value.count;}) // radius
                   .x(d3.scale.linear().domain([dmin,dmax]).range([0,100]))
                   .y(d3.scale.linear().domain([dmin,dmax]).range([0,100]))
                   .r(d3.scale.linear().domain([0, dmax*2]))
                   .title(function (p) {
                        
                        return [
                               "count: " + p.value.count,
                               "sumIndex: " + p.value.sumIndex,
                               "avgIndex: " + p.value.avgIndex,
                               ]
                               .join("\n");
                    })
                   .renderTitle(true)
                   
                    //##### Elastic Scaling
                    //`.elasticX` and `.elasticX` determine whether the chart should rescale each axis to fit data.
                    //The `.yAxisPadding` and `.xAxisPadding` add padding to data above and below their max values in the same unit
                    //domains as the Accessors.
                   .elasticY(true)
                   .elasticX(true)
                   .yAxisPadding(2)
                   .xAxisPadding(2)         
                   .xAxisLabel('xAxisLabel') // (optional) render an axis label below the x axis
                   .yAxisLabel('yAxisLabel') // (optional) render a vertical axis lable left of the y axis             
                   .renderHorizontalGridLines(true)
                   .renderVerticalGridLines(true);  
                
        dc.renderAll();
    };    
})
.controller('tableController', function() {
    var dataset;
    var DataTable = dc.dataTable("#data-table");


    d3.csv("data/data.csv", function(data) {
        dataset = data;
        Graph(dataset);  
    });
        

    function Graph(data) {  
        var ndx = crossfilter(data);
        console.log(data);
        
        dim = ndx.dimension(function(d) {return d.type});

        DataTable.dimension(dim)
                .group(function(d) {
                    return 'This is a nice table';
                })
                // (optional) max number of records to be shown, :default = 25
                .size(10)
                // dynamic columns creation using an array of closures
                .columns([
                    function(d) { return d.name; },
                    function(d) { return d.type; },
                    function(d) { return d.legs; },
                    function(d) { return d.hp; }
                ])
                // (optional) sort using the given field, :default = function(d){return d;}
                .sortBy(function(d){ return d.hp; })
                // (optional) sort order, :default ascending
                .order(d3.ascending);

            dc.renderAll();
    };
})
.controller('rowpieController', function(){
    var dataset;
    var RowChart = dc.rowChart("#rowchart");
    var PieChart = dc.pieChart("#piechart");


    d3.csv("data/data.csv", function(data) {
    
        dataset = data;
        Graph(dataset);
    });
        

    function Graph(data) {
        var ndx = crossfilter(data);
        console.log(data);

        dim = ndx.dimension(function(d) {return d.type});
        g = dim.group().reduceSum(function(d){return d.legs;});

        RowChart.dimension(dim).group(g).elasticX(true).width(500);
         
        dim2 = ndx.dimension(function(d) {return d.name});
        g2 = dim2.group().reduceSum(function(d){return d.hp;});         
                
        PieChart.dimension(dim2).radius(90).innerRadius(25).group(g2).title(function(d){ return d.data.key +": "+d.value;}).renderTitle(true);

        dc.renderAll(); 
    };
})
.controller('rowpielineController', function(){
    var dataset;
    var RowChart = dc.rowChart("#rowchart");
    var PieChart = dc.pieChart("#piechart");
    var LineChart = dc.lineChart("#linechart");


    d3.csv("data/data.csv", function(data) {
        dataset = data;
        Graph(dataset);
    });
        

    function Graph(data) {
        var ndx = crossfilter(data);
        console.log(data);
        
        dim = ndx.dimension(function(d) {return d.type});
        dim2 = ndx.dimension(function(d) {return d.name});
        dimHP = ndx.dimension(function(d) {return d.hp});   

        g = dim.group().reduceSum(function(d){return d.legs;});
        g2 = dim2.group().reduceSum(function(d){return d.legs;});   
        gHP = dimHP.group().reduceSum(function(d){return d.legs;});

        RowChart.dimension(dim).group(g).elasticX(true).width(500);
                
        PieChart.dimension(dim2).radius(90).innerRadius(45).group(g2).title(function(d){ return d.data.key +": "+d.value;}).renderTitle(true); 
                
        var x1 = gHP.top(1)[0].value;
        var x2 = d3.max(gHP.all(), function(d) { return +d.key; }); // had to convert string into int
        var xmax = Math.max(x1, x2);

        LineChart.dimension(dimHP)
                 .group(gHP)
                 .width(800)
                 .height(200)
                 .elasticY(true)         
                 .x(d3.scale.linear().domain([0,xmax]))
                 .brushOn(false)
                 .renderLabel(true)
                 .dotRadius(10) // radius after hoover over datapoint
                 .yAxisPadding(1)
                 .renderHorizontalGridLines(true);
                
        dc.renderAll();
    };
})
.controller('rowpielinebubbleController', function() {
    var dataset;
    var RowChart = dc.rowChart("#rowchart");
    var PieChart = dc.pieChart("#piechart");
    var LineChart = dc.lineChart("#linechart");
    var BubbleChart = dc.bubbleChart("#bubblechart");


    d3.csv("data/data.csv", function(data) {
        data.forEach(function (e) {
            // convert from string to int
            e.hp = +e.hp;
            e.legs = +e.legs;
        }); 
        dataset = data;
        Graph(dataset);
    });
        

    function Graph(data) {
        var ndx = crossfilter(data);
        console.log(data);
        
        var all = ndx.groupAll();
        
        dim = ndx.dimension(function(d) {return d.type});
        dim2 = ndx.dimension(function(d) {return d.name});
        dimHP = ndx.dimension(function(d) {return d.hp});
        dimHP2 = ndx.dimension(function(d) {return d.hp});  

        g = dim.group().reduceSum(function(d){return d.legs;});
        g2 = dim2.group().reduceSum(function(d){return d.legs;});   
        gHP = dimHP.group().reduceSum(function(d){return d.legs;});
        gHP2 = dimHP2.group().reduce( 
            //add
            function(p,v) {
                 ++p.count;
                 p.sumIndex +=v.legs;
                 p.avgIndex=p.sumIndex/p.count;
                  return p;
                },
            //remove
            function(p,v) {
                --p.count; 
                 p.sumIndex -=v.legs;
                 p.avgIndex=p.sumIndex/p.count;
                return p;
                },
            //init
            function() {
                return {count:0, sumIndex:0, 
                    avgIndex:0 };
            }

        );


        RowChart.dimension(dim).group(g).elasticX(true).width(500);
                
        PieChart.dimension(dim2).radius(90).innerRadius(45).group(g2).title(function(d){ return d.data.key +": "+d.value;}).renderTitle(true); 
                
        var x1 = gHP.top(1)[0].value;
        var x2 = d3.max(gHP.all(), function(d) { return +d.key; }); // had to convert string into int
        var xmax = Math.max(x1, x2);

        LineChart.dimension(dimHP)
                 .group(gHP)
                 .width(800)
                 .height(200)
                 .x(d3.scale.linear().domain([0,xmax]).range([0,17]))
                 .renderHorizontalGridLines(true);
                 
        BubbleChart.dimension(dimHP2)
                   .width(500)
                   .height(200)
                   .group(gHP2)
                   .valueAccessor(function(p) {return p.value.sumIndex;})
                   .radiusValueAccessor(function(p) {return p.value.sumIndex;})
                   .x(d3.scale.linear().domain([0,15]).range([0,15]))
                   .y(d3.scale.linear().domain([0,15]).range([0,15]))   
                   .r(d3.scale.linear().domain([0, 4000]))
                   .renderHorizontalGridLines(true)
                   .renderVerticalGridLines(true);

                
        dc.renderAll(); 

    };
})
.controller('rowpielinebubbletableController', function(){
    var dataset;
    var RowChart = dc.rowChart("#rowchart");
    var PieChart = dc.pieChart("#piechart");
    var LineChart = dc.lineChart("#linechart");
    var BubbleChart = dc.bubbleChart("#bubblechart");
    var DataTable = dc.dataTable("#data-table");

    d3.csv("data/data.csv", function(data) {
        data.forEach(function (e) {
            // convert from string to int
            e.hp = +e.hp;
            e.legs = +e.legs;
        }); 
        dataset = data;
        Graph(dataset);
    });
        

    function Graph(data) {
        var ndx = crossfilter(data);
        console.log(data);

        var all = ndx.groupAll();
        
        dim = ndx.dimension(function(d) {return d.type});
        dim2 = ndx.dimension(function(d) {return d.name});
        dimHP = ndx.dimension(function(d) {return d.hp});
        dimHP2 = ndx.dimension(function(d) {return d.hp});  

        g = dim.group().reduceSum(function(d){return d.legs;});
        g2 = dim2.group().reduceSum(function(d){return d.legs;});   
        gHP = dimHP.group().reduceSum(function(d){return d.legs;});
        gHP2 = dimHP2.group().reduce( 
            //add
            function(p,v) {
                 ++p.count;
                 p.sumIndex +=v.legs;
                 p.avgIndex=p.sumIndex/p.count;
                  return p;
                },
            //remove
            function(p,v) {
                --p.count; 
                 p.sumIndex -=v.legs;
                 p.avgIndex=p.sumIndex/p.count;
                return p;
                },
            //init
            function() {
                return {count:0, sumIndex:0, 
                    avgIndex:0 };
            }

        );

        RowChart.dimension(dim).group(g).width(500);
                
        PieChart.dimension(dim).radius(90).innerRadius(45).dimension(dim).group(g).title(function(d){ return d.data.key +": "+d.value;}).renderTitle(true); 

        LineChart.dimension(dimHP)
                 .group(gHP)
                 .width(800)
                 .height(200)
                 .x(d3.scale.linear().domain([0,17]).range([0,17]))
                 .renderHorizontalGridLines(true);
                 
        BubbleChart.dimension(dimHP2)
                   .width(500)
                   .height(200)
                   .group(gHP2)
                   .valueAccessor(function(p) {return p.value.sumIndex;})
                   .radiusValueAccessor(function(p) {return p.value.sumIndex;})
                   .x(d3.scale.linear().domain([0,15]).range([0,15]))
                   .y(d3.scale.linear().domain([0,15]).range([0,15]))   
                   .r(d3.scale.linear().domain([0, 4000]))
                   .renderHorizontalGridLines(true)
                   .renderVerticalGridLines(true);
                   
        DataTable.dimension(dim)
                .group(function(d) {
                    return 'This is a nice table';
                })
                .size(10)
                .columns([
                    function(d) { return d.name; },
                    function(d) { return d.type; },
                    function(d) { return d.legs; },
                    function(d) { return d.hp; }
                ])
                .sortBy(function(d){ return d.hp; })
                .order(d3.ascending);

        dc.renderAll();
    };
})
.controller('inputoptionsController', function() {
    var dataset;
    var types=[];
    var RowChart = dc.rowChart("#rowchart");
    var PieChart = dc.pieChart("#piechart");
    
    d3.csv("data/data.csv", function(data) {
        dataset = data;
        Graph(dataset);
    });
        
    function Graph(data) {
        var ndx = crossfilter(data);
        console.log(data);
        
        dim = ndx.dimension(function(d) {return d.type});
        var rawTypes = dim.top(Infinity);  
        rawTypes.forEach(function (e) {
            // append values to array
            types.push(e.type);
            // only get unique values
            types = $.unique(types);
        });     

        var option = '';
        for (i=0;i<types.length;i++){
           option += '<option value="'+ types[i] + '">' + types[i] + '</option>';
        }
        $("#txt-dropdown").append(option);      
        
        g = dim.group().reduceSum(function(d){return d.legs;});
        
        RowChart.dimension(dim)
                .group(g)
                .width(500)
                .elasticX(true);
                
        dim2 = ndx.dimension(function(d) {return d.name});  
        g2 = dim2.group().reduceSum(function(d){return d.hp;}); 
        
        PieChart.dimension(dim2)
                .radius(90)
                .innerRadius(45)
                .group(g2)
                .title(function(d){ return d.data.key +": "+d.value;})
                .renderTitle(true);

        dc.renderAll();
    };


    // reset dropdown
     $("#txt-dropdown").on('mousedown', function () {
        this.value='';
     });    
    
    // custom filters
     $("#txt-dropdown").on('change click', function () {
        RowChart.filterAll();
        if (this.value != '') {
            RowChart.filter(this.value);
        };
        dc.redrawAll(); 
    });
})
.controller('inputtabsController', function() {
    var dataset;
    var RowChart = dc.rowChart("#rowchart");
    var PieChart = dc.pieChart("#piechart");
    
    d3.csv("data/data.csv", function(data) {
        dataset = data;
        Graph(dataset);
    });
        

    function Graph(data) {
        var ndx = crossfilter(data);
        console.log(data);
        
        dim = ndx.dimension(function(d) {return d.type});
        g = dim.group().reduceSum(function(d){return d.legs;});
        
        RowChart.dimension(dim)
                .group(g)
                .width(500)
                .elasticX(true);
                
        dim2 = ndx.dimension(function(d) {return d.name});  
        g2 = dim2.group().reduceSum(function(d){return d.hp;}); 
        
        PieChart.dimension(dim2)
                .radius(90)
                .innerRadius(45)
                .group(g2)
                .title(function(d){ return d.data.key +": "+d.value;})
                .renderTitle(true);

        dc.renderAll();
    };     


    // Custom filters on row chart
    function filter1() {
        var a = ["human", "dog"];
        a.forEach(function(item) {
            // do something with `item`
            RowChart.filter(item);      
        }); 
        dc.redrawAll();
    };  

    function filter2() {
        RowChart.filter('human');
        dc.redrawAll();
    };

    function filter3() {
        RowChart.filter('dog');
        dc.redrawAll();
    };  

    function filter4() {
        RowChart.filter('bird');
        dc.redrawAll();
    };  

    function filter5() {
        RowChart.filter('food-beast');
        dc.redrawAll();
    };  
})
.controller('inputfilterController', function() {
    var dataset;
    var types=[];
    var RowChart = dc.rowChart("#rowchart");
    var PieChart = dc.pieChart("#piechart");
    
    d3.csv("data/data.csv", function(data) {
        dataset = data;
        Graph(dataset); 
    });
        
    function Graph(data) {
        var ndx = crossfilter(data);
        console.log(data);
        
        dim = ndx.dimension(function(d) {return d.type});
        var rawTypes = dim.top(Infinity);
        rawTypes.forEach(function (e) {
            // append values to array
            types.push(e.type);
            // only get unique values
            types = $.unique(types);
        });     
        
        g = dim.group().reduceSum(function(d){return d.legs;});
        
        RowChart.dimension(dim).group(g).width(500).elasticX(true);
                
        dim2 = ndx.dimension(function(d) {return d.name});  
        g2 = dim2.group().reduceSum(function(d){return d.hp;}); 
        
        PieChart.dimension(dim2)
                .radius(90)
                .innerRadius(45)
                .group(g2)
                .title(function(d){ return d.data.key +": "+d.value;})
                .renderTitle(true);

        dc.renderAll();

    };


    // custom filters
    $("#table-search").on('input', function () {
        // reset filter
        RowChart.filterAll();
        // only apply filter if input is not blank and a valid type
        if (this.value != '' && types.indexOf(this.value) > -1) {
            RowChart.filter(this.value);
        }; 
        dc.redrawAll();     
    });
})
.controller('keyboardController', function() {
    var dataset;
    var types=[];
    var counter = 0;
    var RowChart = dc.rowChart("#rowchart");
    var PieChart = dc.pieChart("#piechart");
    
    // Load csv file
    d3.csv("data/data.csv", function(data) {
        dataset = data;
        Graph(dataset);
    });
        
    function Graph(data) {
        var ndx = crossfilter(data);
        console.log(data);
        
        dim = ndx.dimension(function(d) {return d.type});
        var rawTypes = dim.top(Infinity);
        
        rawTypes.forEach(function (e) {
            // append values to array
            types.push(e.type);
            // only get unique values
            types = $.unique(types);
        });     
        
        g = dim.group().reduceSum(function(d){return d.legs;});
        
        RowChart.dimension(dim).group(g).width(500).elasticX(true);
                
        dim2 = ndx.dimension(function(d) {return d.name});  
        g2 = dim2.group().reduceSum(function(d){return d.hp;}); 
        
        PieChart.dimension(dim2)
                .radius(90)
                .innerRadius(45)
                .group(g2)
                .title(function(d){ return d.data.key +": "+d.value;})
                .renderTitle(true);

        dc.renderAll();
    };


    // on key down event    
    $("body").on('keydown', function (d) {

        // max length of array
        var max = types.length - 1;
        if (d.which === 39) {
            counter = counter + 1;  
            if (counter < 0){
                counter = 0;
            }
            else if (counter > max) {
                counter = max;
            };
            RowChart.filterAll();
            // only apply filter if input is not blank
            if (this.value != '') {
                RowChart.filter(types[counter]);
            }; 
            dc.redrawAll();
        
        }
        
        else if (d.which === 37) {
            // update counter
            counter = counter - 1;  
            if (counter < 0){
                counter = 0;
            }
            else if (counter > max) {
                counter = max;
            };
            // reset filter
            RowChart.filterAll();
            // only apply filter if input is not blank
            if (this.value != '') {
                RowChart.filter(types[counter]);
            };
            dc.redrawAll();
        };
    });
});




































