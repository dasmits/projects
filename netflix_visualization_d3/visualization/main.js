const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const marg = {top: 40, right: 100, bottom: 40, left: 175};

let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 250;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;


d3.csv('netflix.csv').then(d=>{
    preprocess = x =>{
        return {
            id:parseInt(x.show_id),
            title: x.title,
            cast: x.cast.split(',').map(i=>i.trim()),
            genres: x.listed_in.split(',').map(i=>i.trim()),
            director: x.director.split(',').map(i=>i.trim()),
            date: Date.parse(x.date_added),
            year:parseInt(x.release_year),
            length: parseInt(x.duration),
            is_movie: x.type == 'Movie'
        }
    }

    data = d.map(m=>preprocess(m))
    
    //Length per year
    lpy = {}

    //Title per genre
    tpg = {}

    //Director-actor pairs
    dap = {}

    data.forEach(x => {
        if(x.is_movie){
            (typeof lpy[x.year] == 'undefined')?lpy[x.year] = [x.length]:lpy[x.year].push(x.length);
            x.director.forEach(d=>{
               x.cast.forEach(c=>{
                    if(c!=='' && d!==''){    
                        dc = d+'_'+c;
                       (typeof dap[dc] == 'undefined')?dap[dc]=1: dap[dc]=dap[dc]+1;
                    }
               });
            })
        }
        
        x.genres.forEach(g=>{
            (typeof tpg[g] == 'undefined')?tpg[g]=1: tpg[g]++;
        })
    });    

    // Movies per Genre:

    margin = {top:10, right: 20, bottom: 55, left:55}
    height = 400-margin.top-margin.bottom
    width = 600 - margin.left - margin.right

    d3.select('#graph1').append('p')
        .attr('class', 'text')
        .html('Count of movies/shows by genre on Netflix <br\> \
                Hover for more information')

    svg1 = d3.select('#graph1')
        .append('svg')
        .attr('width',width+margin.left+margin.right)
        .attr('height',height+margin.top+margin.bottom)
        .append('g')
        .attr('transform',
            'translate(' + margin.left + ',' + margin.top + ')');

    gdata = Object.entries(tpg)
        .map(x=>{return {genre:x[0],count:x[1]};})
        .sort((x,y)=>x.count-y.count);

    tt1 = d3.select('body').append('div')	
        .attr('id', 'tt1')				
        .style('opacity', 0);

    x = d3.scaleBand()
        .range([0,width])
        .padding(0.2);
    
    x.domain(gdata.map(d=>d.genre))
    
    y = d3.scaleLinear()
        .domain([0,d3.max(gdata,d=>d.count)])
        .range([height,0]);

    xAxis = d3.axisBottom(x).tickFormat(x=>x.slice(0,5).toLowerCase()+'...');
    yAxis = d3.axisLeft(y).ticks(10);

    bar = svg1.selectAll('.bar')
        .data(gdata);

    bar.enter()
        .append('rect')
        .attr('class','bar')
        .attr('x',d=>x(d.genre))
        .attr('width', x.bandwidth())
        .attr('y',d=>y(d.count))
        .attr('height',d=>height-y(d.count));

    svg1.selectAll('.bar').on('mouseover',d=>{
            d3.select(d3.event.target)
                .transition()
                .duration(100)
                .style('fill', 'rgb(245,198,24)');
            tt1.transition()
                .duration(150)
                .style('opacity',.8);
            tt1.html(d.genre + ': <br/> '+d.count)
                .style('left', d3.event.pageX+'px')
                .style('top', (d3.event.pageY-28)+'px');
        })
        .on('mouseout', d=>{
            d3.select(d3.event.target)
                .transition()
                .duration(250)
                .style('fill', '#e50914');
            tt1.transition()
                .duration(400)
                .style('opacity', 0);
        })
    

    svg1.append('g')
        .attr('transform', 'translate(0,'+height+')')
        .attr('class', 'x axis text')
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.2em')
        .attr('dy', '0em')
        .attr('transform', 'rotate(-65)');


    svg1.append('text')             
        .attr('transform',
              'translate('+(width/2)+' ,'+(height + margin.bottom-10)+')')
        .attr('class', 'text')
        .style('text-anchor', 'middle')
        .text('Genre');
    
    svg1.append('g')
        .call(yAxis)
        .attr('class', 'y axis text');
    
    svg1.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0-margin.left)
        .attr('x',0-(height/2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .attr('class', 'text')
        .text('Count');



    
    // Movies per Year
    years = Object.keys(lpy)
    year_ext = d3.extent(years)
    years = [...Array(year_ext[1]-year_ext[0]+1).keys()].map(x=>x+parseInt(year_ext[0]))
    
    years.forEach(y=>(typeof lpy[y] == 'undefined')?lpy[y]=0:lpy[y]=d3.mean(lpy[y]))
    ydata = Object.entries(lpy).map(x=>{
        return {year:x[0], avg:x[1]};
    })

    avgs_ext = d3.extent(ydata, (d,i)=>d.avg)
    
    margin = {top:20, right: 20, bottom: 30, left:50}
    height = 400-margin.top-margin.bottom
    width = 600 - margin.left - margin.right

    x = d3.scaleLinear().domain(year_ext).range([0,width])
    y = d3.scaleLinear().domain(avgs_ext).range([height,0])

    xAxis = d3.axisBottom(x).tickFormat(x=>x.toString())
    yAxis = d3.axisLeft(y).ticks(10)

    g2text = d3.select('#graph2').append('p')
        .attr('class', 'text')
        .html('Avg runtime of movies per year on Netflix (red) <br\> \
                Avg runtime per of 100 best movies per year from IMDb (gold)')

    svg2 = d3.select('#graph2')
        .append('svg')
        .attr('width',width+margin.left+margin.right)
        .attr('height',height+margin.top+margin.bottom)
        .append('g')
        .attr('transform',
            'translate(' + margin.left + ',' + margin.top + ')');

            
    valLine = d3.line()
        .x(d=>x(d.year))
        .y(d=>y(d.avg));
        
    area = d3.area()
        .x(d=>x(d.year))
        .y0(height)
        .y1(d=>y(d.avg))
        
    path = svg2.append('path')
        .data([ydata])
        .attr('class','area')
        .attr('d', area)
        
        
    path = svg2.append('path')
        .data([ydata])
        .attr('class','netflix line')
        .attr('d', valLine);
    

    svg2.append('g')
        .attr('class', 'x axis text')
        .attr('transform', 'translate(0,'+height+')')
        .call(xAxis);
    
    svg2.append('text')             
        .attr('transform',
              'translate('+(width/2)+' ,'+(height + margin.bottom)+')')
        .attr('class', 'text')
        .style('text-anchor', 'middle')
        .text('Year');
        
    svg2.append('g')
        .attr('class', 'y axis text')
        .call(yAxis);
        
    
    svg2.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0-margin.left)
        .attr('x',0-(height/2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .attr('class', 'text')
        .text('Avg. Length (mins)');

    d3.csv('imdb_100.csv').then(d=>{
        idata=d.map(x=>{return {year:parseInt(x.startYear), avg:parseFloat(x.runtimeMinutes)}})
        
        path = svg2.append('path')
            .data([idata])
            .attr('class','imdb line')
            .attr('d', valLine);

        meanSqrd = idata.map((v,i)=>(v.avg-ydata[i].avg)**2)
        meanSqrd = meanSqrd.reduce((p,c)=>c+p)
        meanSqrd /= idata.length
    });
        


    // Directors + Actors
    d3.select('#graph3').append('p')
        .attr('class', 'text')
        .html('Actors (red) and directors (gold) by count of collaborations. \
                Hover for more information, drag to navigate, and slide to change count')
    damin = 1
    dadata = Object.entries(dap)
                .map(x=>{return{da:x[0].split('_'), count:x[1]}})
                .filter(x=>x.count>=damin);
    damax = d3.max(dadata, d=>d.count);


    sliderDiv = d3.select("#graph3").append('div')
        .attr('id', 'sliderDiv');


    sliderTick = sliderDiv.append('div')
        .attr('class','text')
        .attr('id', 'sliderTick')

    sliderTick.append('span').attr('class','text').html("Min "+damin)
    currentNum = sliderTick.append('span').attr('class','text')
    sliderTick.append('span').attr('class','text').html("Max "+damax)


    daarray = new Array(damax+1).fill(0).map(x=>new Object({nodes:{},links:[]}));
    
    dadata.forEach(x=>{
        if(daarray[x.count].links.length<1000){
            if(typeof daarray[x.count].nodes[x.da[0]] == 'undefined'){
                daarray[x.count].nodes[x.da[0]] = true
            }
            if(typeof daarray[x.count].nodes[x.da[1]] == 'undefined'){
                daarray[x.count].nodes[x.da[1]] = false
            }
            daarray[x.count].links.push({source:x.da[0],target:x.da[1]});
        }
    })
    
    daarray = daarray.map(x=>{
            return{
                nodes:Object.entries(x.nodes).map(n=>{return{name:n[0],is_dir:n[1]}}),
                links:x.links
            }
        })


    //RANGE SLIDER
    slider = d3.select('#graph3')
        .append('input')
        .attr('type', 'range')
        .attr('min', damin)
        .attr('max', damax)
        .attr('step', '1')
        .attr('id', 'slider')
        .property('value', damin);

    val =damin;
    currentNum.html("# Films Together ("+val+")")
    data = daarray[val];
    
    svg3 = d3.select('#graph3')
                .append('svg')
                .attr('width',600)
                .attr('height',600)
                .call(d3.zoom().on('zoom',()=>{svg3.attr('transform', d3.event.transform)}))
                .append('g')
                .attr('transform',
                    'translate(' + margin.left + ',' + margin.top + ')');
        
    
                    
    links = svg3.selectAll('line')
        .data(data.links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .style('opacity', .85)

    nodes = svg3.selectAll('circle')
        .data(data.nodes)
        .enter()
        .append('circle')
        .attr('r',d=>(d.is_dir)?15:10)
        .attr('class', d=>(d.is_dir)?'node director':'node actor')


    tt3 = d3.select('body').append('div')	
        .attr('id', 'tt3')				
        .style('opacity', 0);

    svg3.selectAll('.node').on('mouseover',d=>{
            d3.select(d3.event.target)
                .transition()
                .duration(250)
                .attr('class', 'node text');
            tt3.transition()
                .duration(150)
                .style('opacity',.8);
            tt3.html(d.name)
                .style('left', d3.event.pageX+'px')
                .style('top', (d3.event.pageY-28)+'px');
        })
        .on('mouseout', d=>{
            d3.select(d3.event.target)
                .transition()
                .duration(250)
                .attr('class', d=>(d.is_dir)?'node director':'node actor');
            tt3.transition()
                .duration(400)
                .style('opacity', 0);
        })

    tick = ()=>{
        links
            .attr('x1', d=>d.source.x)
            .attr('y1', d=>d.source.y)
            .attr('x2', d=>d.target.x)
            .attr('y2', d=>d.target.y);
        nodes
            .attr('cx', d=>d.x+5)
            .attr('cy', d=>d.y-5 )
    }

    simulation = d3.forceSimulation(data.nodes)
        .force('link', d3.forceLink()
            .id(d=>d.name)
            .links(data.links)
            .distance(40)
        )
        .force('charge', d3.forceManyBody().strength(-150))
        .force('center', d3.forceCenter(300,300))
        .force('forceX',d3.forceX().strength(.2).x(.5))
        .force('forceY', d3.forceY().strength(.2).y(.5))
        .on('tick', tick)
    
    refresh = () =>{
        val = (d3.event)?d3.event.target.value:daarray.length-1;
        currentNum.html("# Films Together ("+val+")")
        data = daarray[val]
        
        nodes = nodes.data(data.nodes)
        links = links.data(data.links)
        
        links.transition()
            .duration(500)
            .style('opacity',0)
            
        nodes.transition()
            .duration(500)
            .attr('r', 1e-5);
            
        links.exit().remove();
        nodes.exit()
            .remove();

            
        links = links
            .enter()
            .append('line')
            .merge(links)
            .attr('class', 'link');
        
        nodes = nodes.enter()
            .append('circle')
            .merge(nodes)
            .attr('class', d=>(d.is_dir)?'node director':'node actor')
            
        links.transition()
            .duration(500)
            .style('opacity',.85);
            
        nodes.transition()
            .duration(500)
            .attr('r',d=>(d.is_dir)?13:10); 
        simulation.nodes(data.nodes);
        simulation.force('link').links(data.links).id(d=>d.name);
        simulation.alpha(1).restart();
        
        svg3.selectAll('.node').on('mouseover',d=>{
            d3.select(d3.event.target)
                .transition()
                .duration(250)
                .attr('class', 'node text');
            tt3.transition()
                .duration(150)
                .style('opacity',.8);
            tt3.html(d.name)
                .style('left', d3.event.pageX+'px')
                .style('top', (d3.event.pageY-28)+'px');
        })
        .on('mouseout', d=>{
            d3.select(d3.event.target)
                .transition()
                .duration(250)
                .attr('class', d=>(d.is_dir)?'node director':'node actor');
            tt3.transition()
                .duration(400)
                .style('opacity', 0);
        })
    }

    slider.on('input',refresh);

})
