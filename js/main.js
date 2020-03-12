(function(){
    var status;
    const INFO_DIV_ID = 'project-info'
    const panelNames = ['control','main','projects','title','imgs','thumb-img','main-img']
    const panels = panelNames.reduce(
        (acc,name) => {
            acc[name] = document.getElementById(name+'-panel')
            return acc
        },{}
    )

    var config = {
        dirImg : 'img/',
        dirIcons : 'img/icons/',
        breakpoints : {
            sm : 576,
            md : 768,
            lg : 960
        }
    }
    const smAndMd = () => window.innerWidth > config.breakpoints.sm &&
        window.innerWidth < config.breakpoints.lg
    const xsOnly = () =>  window.innerWidth < config.breakpoints.sm
    const lgAndUp = () => window.innerWidth > config.breakpoints.lg

    function updateProjectsStyle (style) {
        Array.from(document.getElementsByClassName('col-item'))
        .forEach(colItem=>Object.assign(colItem.style,style))
    }

    function hideElementsByClass (className) {
        Array.from(document.getElementsByClassName(className))
        .forEach(el=>el.style.height = 0)
    }

    function updatePanelClasses (version) {
        Object.values(panels).forEach((el,i)=>el.classList = config.panel[version][panelNames[i]])
    }

    function getItemFromEl (el) {
        const index = el.getAttribute('index')
        return items[index]
    }

    function setGallery (item,delay) {
        delay = delay || 1000


        const img = new htmlHelper().img(config.dirImg+item.imgs[0])
        const thumbs = item.imgs.map(
            imgPath => Helper.img(config.dirImg+imgPath)
        )
        const thumbContainer = Helper.el('div', thumbs)

        const wrapper = panels.imgs.firstElementChild
        const mainSlot = wrapper.firstElementChild
        const thumbSlot = mainSlot.nextElementSibling

        if (smAndMd()) mainSlot.style.position = "absolute"

        mainSlot.innerHTML = thumbSlot.innerHTML = ''

        mainSlot.appendChild(img)
        thumbSlot.appendChild(thumbContainer)

        setTimeout(()=>{
            mainSlot.style.opacity = 1
        },delay*0.7)

        setTimeout(()=>{
            img.style.opacity = 1
            thumbs.forEach((img,i)=>img.style.opacity = 0.6)
        },delay)

    }

    function gridView () {
        document.body.classList.remove('gallery-view')
        panels.imgs.classList.replace('d-flex', 'hide')
        panels.imgs.style.paddingBottom = '0'
        panels.title.style.opacity = 1
        init()
        /*
        updatePanelClasses('grid')
        updateProjectsStyle({minWidth:'200px;'})
        setTimeout(()=>{
        Object.values(panels).forEach(x=>x.classList.remove('minimise'))
    },800)
    */
}

function nextImg() {
    const current = panels['main-img'].firstChild.src
    const thumbs = Array.from(panels['thumb-img'].querySelectorAll('img'))
    console.log(current, thumbs)
    let found = false
    thumbs.forEach((x,i)=>{
        console.log(x.src, current, x.src===current)
        if (!found&&x.src===current) {
            found = true
            const next = thumbs[i+1]
            if (!next) nextProject()
            else panels['main-img'].firstChild.src = next.src
        }
    })
}

function nextProject() {
    const current = document.getElementById(INFO_DIV_ID)
    let currentIndex = parseInt(current.getAttribute('index'))
    const projects = panels.control.children

    if (currentIndex===projects.length) currentIndex = -1

    console.log(currentIndex)

    for (let x=0;x<projects.length;x++) {
        if (parseInt(projects[x].getAttribute('index')) === currentIndex + 1) {
            return galleryView(projects[x])
        }
    }
    gridView()
}

function switchContent (el1,el2) {
    const clone1 = el1.cloneNode(true)
    const clone2 = el2.cloneNode(true)
    el1.setAttribute('index',el2.getAttribute('index'))
    el1.replaceChild(clone2.firstChild, el1.firstChild)
    el2.replaceChild(clone1.firstChild, el2.firstChild)
}

function addToControlPanel (item) {
    const clone = item.cloneNode(true)
    clone.addEventListener('click',galleryView)
    item.style.visibility = 'hidden'
    panels.control.appendChild(clone)
}

function setTimeoutPromise(delay,fn,...args) {
    return new Promise((res,rej)=>{
        setTimeout(()=>{
            fn(...args)
            res()
        },delay)
    })
}

function shiftProject(el) {
    const pos = el.getBoundingClientRect()
    const imgPanelPos = panels['main-img'].getBoundingClientRect()
    console.log(imgPanelPos)
    if (lgAndUp()) {
        const shift = imgPanelPos.right - pos.x
        el.style.transform = `translateX(${shift}px)`
        el.style.maxWidth = document.getElementById('control-panel').offsetWidth + 'px'
        console.log(document.getElementById('control-panel').offsetWidth, el.style.maxWidth)
    } else if (smAndMd()) {
        const shift = imgPanelPos.bottom - pos.y
        el.style.transform = `translateY(${shift}px)`
    }  /*{
        const titlePanel = document.getElementById('title-panel')
        const shift = titlePanel.getBoundingClientRect().top - pos.top
        console.log(shift, pos.top, titlePanel.getBoundingClientRect().top)
        el.style.transform = `translateY(${shift}px)`
        el.style.maxWidth = titlePanel.offsetWidth + 'px'
    }*/

}


async function galleryView (el,direct) {
    //updateProjectsStyle({minWidth:'100%'})
    el = el.constructor.name === 'MouseEvent' ? el.currentTarget : el
    const item = getItemFromEl(el)

    const info = document.getElementById(INFO_DIV_ID)

    if (info) {
        switchContent(info,el)
        return setGallery(item,100)
    }

    el.setAttribute('id', INFO_DIV_ID)

    //panels.projects.classList = config.panel.v2.project
    document.body.classList.add('gallery-view')

    el.classList.remove('col-item')
    const colItems = Array.from(document.getElementsByClassName('col-item'))

    await Promise.all(
        colItems.reverse().map((item,i)=>{
            item.classList.add('minimise')
            return setTimeoutPromise(100*i, addToControlPanel, item)
        })
    )

    await new Promise((res,rej) =>{
        setTimeout(()=>{
            panels.imgs.classList.replace('hide', 'd-flex')
            if (smAndMd()) panels.imgs.style.paddingBottom = '120px'
            if (xsOnly()) panels.title.style.opacity = 0
            shiftProject(el)
            res()
        },500)
    })

    setGallery(item,1200)

}


function init() {
    Array.from(['projects','control']).forEach(x=>panels[x].innerHTML = '')

    items.forEach((item,i)=>{
        const div = new htmlProject(item,i,config).html()
        div.style.opacity = 0
        div.addEventListener('click',galleryView)
        panels.projects.appendChild(div)
        setTimeout(()=> div.style.opacity = 1, 500/items.length*i)
    })
}


document.getElementById('grid-view-switch').addEventListener('click',gridView)

panels.imgs.addEventListener('click',nextImg)

const Helper = new htmlHelper()
init()

})()