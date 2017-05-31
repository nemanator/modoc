const validate = require('validate-npm-package-name')
const axios = require('axios')
const main = require('./main.css')
require('./manifest.json')
// let txt = fs.readFileSync(testDir, 'UTF-8')

let isJavaScript = document.getElementsByClassName('type-javascript').length > 0

function validateModule(name) {
	let validation = validate(name)
	let isValid = validation.validForNewPackages || validation.validForOldPackages
	if (validation.warnings) {
		validation.warnings.forEach(warning => {
			if (warning === 'path is a core module name') {
				isValid = false
			}
		})
	}
	return {
		isValid,
		validation
	}
}

if (isJavaScript) {
	let spans = document.getElementsByClassName('pl-c1')
	let modules = []
	let npmRegistry = 'https://registry.npmjs.org/'
	Object.keys(spans).forEach(span => {
		if (spans[span].innerText == 'require') {
			let moduleEl = spans[span].nextSibling.nextSibling
			let fileLine = spans[span].parentElement
			let name = moduleEl.innerText.replace(/['"`]/g, '')
			let { isValid, validation } = validateModule(name)
			if (isValid) {
				module = { name, validation }
				axios.get(`${npmRegistry}${name}`).then(json => {
					let href = json.data.repository.url.split('//')[1]
					fileLine.innerHTML += `
						<span class="dropdown">${json.data.description} - <a target="_blank" href="https://${href}">Documentation</a></span>
					`
					spans[span].nextSibling.nextSibling.classList.add('module')
					spans[span].nextSibling.nextSibling.addEventListener('click', e => {
						let parent = e.target.parentElement
						let descriptionSpan = document.createElement('span')
						descriptionSpan.innerText = json.data.description
						descriptionSpan.classList.add('dropdown')

						parent.classList.forEach(classItem => {
							if (classItem == 'toggled') {
								parent.classList.remove('toggled')
								descriptionSpan.classList.remove('toggled')
								parent.childNodes[parent.children.length - 1].classList.remove('toggled')
								let description = parent.childNodes[parent.children.length - 1]
								console.log(description)
							} else {
								parent.classList.add('toggled')
								parent.childNodes[parent.children.length - 1].classList.remove('toggled')

								descriptionSpan.classList.add('toggled')
							}
						})

					})
				}).catch(error => {
					console.error(error)
				})
				
				modules.push(module)
			}
		}
	})
}

function toggle(e) {
	
}


// let builtInModules = [ 'assert', 'buffer', 'child_process', 'cluster', 'console', 'constants', 'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'https', 'module', 'net', 'os', 'path', 'process', 'punycode', 'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'timers', 'tls', 'tty', 'url', 'util', 'v8', 'vm', 'zlib' ]
