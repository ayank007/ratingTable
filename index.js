$(function() {
    // filter navbar
    $(".filter .nav > div").on("click", function(){
        let width = parseFloat($(this).width()) + 20 + 'px'
        let left = parseFloat($(this).offset().left) - parseFloat($(this).parent().offset().left) - 10
        let data = $(this).data("nav")

        $(".filter .nav > div.active").removeClass("active")
        $("this").addClass("active")

        changeFilterCon(data)
        $(".underline").width(width).css("left", left)
    })
    // changing filter content based on filter navigation
    function changeFilterCon(data){
        $(".filter .content > div.active").removeClass('active')
        $(`.filter .content > div[data-con="${data}"]`).addClass('active')
    }

    // Defining / Getting Array
    let ratingArr = [
        [3333, 5, "2022-02-22"],
        [1111, 2, "2022-05-02"],
        [4444, 1, "2022-01-31"],
        [9999, 4, "2022-04-20"],
        [2222, 3, "2022-05-10"],
        [5555, 2, "2022-03-17"],
        [6666, 4, "2022-04-09"],
        [2833, 1, "2022-01-01"],
        [3566, 4, "2022-02-20"],
        [7777, 3, "2022-01-10"],
        [2983, 2, "2022-04-17"],
        [1093, 5, "2022-05-09"],
    ]

    // Set data value -> only rating counts [for chart]
    let dataValue = [0,0,0,0,0]
    for(let rating of ratingArr){
        dataValue[rating[1]-1]+=1
    }

    // initializing table
    const ratingTable = $('#ratingTable').DataTable()
    // Drawing rating Table
    for(let index in ratingArr){
        let dateFmt = ratingArr[index][2].split("-")
        dateFmt = dateFmt[2]+'-'+dateFmt[1]+'-'+dateFmt[0]
        date = '<span style="display:none;">'+ratingArr[index][2]+'</span><span>'+dateFmt+'</span>'
        ratingTable.row.add(
            [
                index,
                ratingArr[index][0],
                '<span style="display:none;">'+ratingArr[index][1]+'</span>'
                    +'<span class="star'+ratingArr[index][1]+'"><i class="fa fa-star"></i>'+ratingArr[index][1]+' Star </span>',
                date
            ]
        ).draw(false)
    }

    // Creating Bar Charts
    const root = am5.Root.new("barChart")
    // Set themes, animation
    // root.setThemes([
    //     am5themes_Animated.new(root)
    // ])
    // Create chart
    const chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        pinchZoomX:false
    }))
    // Add cursor
    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}))
    cursor.lineX.set("visible", false)
    // Setting Axises
    let yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
        maxDeviation: 1,
        categoryField: "rating",
        renderer: am5xy.AxisRendererY.new(root, { minGridDistance: 30 }),
        tooltip: am5.Tooltip.new(root, {})
    }))
    let xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
        maxDeviation: 1,
        renderer: am5xy.AxisRendererX.new(root, {})
    }))
    // Create series
    const series = chart.series.push(am5xy.ColumnSeries.new(root, {
        name: "Rating Series",
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: "value",
        sequencedInterpolation: true,
        categoryYField: "rating",
        tooltip: am5.Tooltip.new(root, {
            labelText:"{valueX}"
        })
    }))
    // Setting Bar Color
    series.set("fill", am5.color(0x01987A));
    // Styling Bars
    series.columns.template.setAll({
        cornerRadiusTR: 5,
        cornerRadiusBR: 5,
        cursorOverStyle: "pointer"
    })
    // update Chart function
    function updateChart(dataValue){
        let data = [{
            rating: "1 Star",
            value: dataValue[0]
        }, {
            rating: "2 Star",
            value: dataValue[1]
        }, {
            rating: "3 Star",
            value: dataValue[2]
        }, {
            rating: "4 Star",
            value: dataValue[3]
        }, {
            rating: "5 Star",
            value: dataValue[4]
        }]

        yAxis.data.setAll(data)
        series.data.setAll(data)
    }
    updateChart(dataValue)

    // Date Filter
    let minDate, maxDate
    // Custom filtering function which will search data in column four (3) between two values (Date)
    $.fn.dataTable.ext.search.push(
        function( settings, data, dataIndex ) {
            let min = minDate.val()
            let max = maxDate.val()
            let date = new Date( data[3].substring(0,10) )
            if(
                ( min === null && max === null ) ||
                ( min === null && date <= max ) ||
                ( min <= date && max === null ) ||
                ( min <= date && date <= max )
            ){
                return true;
            }
            return false;
        }
    )
    $.fn.dataTable.render.moment = function ( from, to, locale ) {
        // Argument shifting
        if ( arguments.length === 1 ) {
            locale = 'en';
            to = from;
            from = 'YYYY-MM-DD';
        }
        else if ( arguments.length === 2 ) {
            locale = 'en';
        }
        return function ( d, type, row ) {
            if (! d) {
                return type === 'sort' || type === 'type' ? 0 : d;
            }
            let m = window.moment( d, from, locale, true );
            // Order and type get a number value from Moment, everything else
            // sees the rendered value
            return m.format( type === 'sort' || type === 'type' ? 'x' : to );
        }
    }
    minDate = new DateTime($('#min'), {
        format: 'MM/DD/YYYY'
    })
    maxDate = new DateTime($('#max'), {
        format: 'MM/DD/YYYY'
    })
    // Refilter the table
    $('#min, #max').on('change', function () {
        ratingTable.draw()
        sortChart($("#min").val(), $("#max").val())
    })
    $('#min, #max').on('keydown', function () {
        setTimeout(()=>{
            if($("#min").val()==null || $("#min").val()=='' || $("#max").val()==null || $("#max").val()==''){
                ratingTable.draw()
                sortChart($("#min").val(), $("#max").val())
            }
        },100)
    })

    // select only month filter
    $('#selectMonth').datepicker({
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        dateFormat: 'MM yy',
        onClose: function(dateText, inst) { 
            $(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1))
            let data = $(this).val().split(" ")
            let month = data[0]
            let year = parseInt(data[1])
            switch(month){
                case "January":
                    month=0
                    break
                case "February":
                    month=1
                    break
                case "March":
                    month=2
                    break
                case "April":
                    month=3
                    break
                case "May":
                    month=4
                    break
                case "June":
                    month=5
                    break
                case "July":
                    month=6
                    break
                case "August":
                    month=7
                    break
                case "September":
                    month=8
                    break
                case "October":
                    month=9
                    break
                case "November":
                    month=10
                    break
                case "December":
                    month=11
                    break
                default:
                    month=0
                    break
            }
            let theMonth = (month+1)+"-"+year
            $("#ratingTable_filter input").val(theMonth)
            sortChart(-1,-1,theMonth)
            setTimeout(()=>{
                $("#ratingTable_filter input").trigger("input")
            },10)
        }
    })
    $(".clearSelectMonth").on("click", function(){
        $("#ratingTable_filter input").val(null)
        $("#selectMonth").val(null)
        updateChart(dataValue)
        setTimeout(()=>{
            $("#ratingTable_filter input").trigger("input")
        },10)
    })

    // Sort Chart based on filters
    function sortChart(min,max,selectedDate="-"){
        let dataValue = [0,0,0,0,0]
        if(min==-1 || max==-1){
            for(let rating of ratingArr){
                let date = new Date(rating[2])
                let month = date.getMonth()
                let year = date.getFullYear()
                let month1 = selectedDate.split("-")[0]
                let year1 = selectedDate.split("-")[1]
                if(month+1==month1 && year==year1){
                    dataValue[rating[1]-1]+=1
                }
            }
        }
        else{
            for(let rating of ratingArr){
                let date = new Date(rating[2])
                let min1, max1
                if(max==""){
                    max1=date
                }
                else{
                    max1=new Date(max)
                }
                if(min==""){
                    min1=date
                }
                else{
                    min1=new Date(min)
                }
                if(date >= min1 && date <= max1){
                    dataValue[rating[1]-1]+=1
                }
            }
        }
        updateChart(dataValue)
    }
    
})