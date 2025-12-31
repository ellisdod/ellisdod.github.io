class htmlHelper {
  constructor(project) {
    this.project = project
  }

  el(type, child, classList) {
    let el = document.createElement(type)
    if (classList) el.classList = classList
    if (!child) return el
    if (Array.isArray(child)) child.forEach((x) => el.appendChild(x))
    else if (typeof child === 'object') el.appendChild(child)
    else el.appendChild(document.createTextNode(child))

    return el
  }

  img(src, alt, classList) {
    const img = this.el('img', null, classList)
    img.src = src
    img.alt = alt || src
    return img
  }

  a(href, child, classList) {
    const a = this.el('a', child, classList)
    a.href = href
    return a
  }
}

class htmlProject extends htmlHelper {
  constructor(project, index, config) {
    super()
    this.project = project
    this.index = index
    this.config = config
  }

  createTags() {
    return this.el('div', this.project.tags.join(', '), 'tags font-weight-bolder')
  }

  createGlyphs() {
    const el = this.el('div', null, 'glyphs')
    if (!this.project.github) return el
    const link = this.a(this.project.github, this.img(this.config.dirIcons + 'github.svg'))
    el.appendChild(link)
    return el
  }

  createDesc() {
    const el = this.el('div', this.project.desc, 'description')
    return el
  }

  createTitle() {
    const el = this.el('h2', this.project.title)
    return el
  }

  createLink() {
    const text = this.project.website.replace(/https?:\/\//, '').replace('/', '')
    return this.el('div', this.a(this.project.website, text))
  }

  html() {
    const outer = this.el('div', null)
    outer.setAttribute('index', this.index)
    outer.classList = 'col-item col-12 col-sm-6 col-md-6 col-lg-4 px-0 pr-3 pr-sm-5 px-lg-3'
    const inner = this.el('div', null, 'project')

    inner.appendChild(this.createTitle())
    inner.appendChild(this.createLink())
    inner.appendChild(this.createDesc())
    inner.appendChild(this.createGlyphs())
    inner.appendChild(this.createTags())

    outer.appendChild(inner)
    return outer
  }
}
