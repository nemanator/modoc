import validate from 'validate-npm-package-name'
import axios from 'axios'
import main from './main.css'
import './manifest.json'
import './icons/document-16.png'
import './icons/document-48.png'
import './icons/document-128.png'

// check to see if the file type is javascript
let isJavaScript = document.getElementsByClassName('type-javascript').length > 0

// a function to validate if a module is even a valid module name.
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

// only attempt find docs if the file is javascript
if (isJavaScript) {
	// find all spans with class of pl-c1 or pl-k. This is the class name of require statements
	let spans = document.querySelectorAll('.pl-c1,.pl-k')
	let modules = []
	let npmRegistry = 'https://registry.npmjs.org/'

	// iterate over the require statements.
	Object.keys(spans).forEach(span => {
		// make sure the span is a require statement
		if (spans[span].innerText === 'require' || spans[span].innerText === 'from') {
			// moduleEl is the actual name of the module. example: 'axios'
			let moduleEl = spans[span].nextSibling.nextSibling
			// fileLine is the line of the require statement
			let fileLine = spans[span].parentElement
			// name is moduleEl, parsed. ex: 'axios' => axios
			let name = moduleEl.innerText.replace(/['"`]/g, '')
			let { isValid, validation } = validateModule(name)
			if (isValid) {
				// add a classname for future styling
				moduleEl.classList.add('module')				
				module = { name, validation }
				// make a request to the NPM registry to get module information.
				axios.get(`${npmRegistry}${name}`).then(json => {
					let href = json.data.repository.url.split('//')[1]
					let dropDown = document.createElement('span')
					dropDown.classList.add('dropdown')
					
					// create the link element of the dropDown
					let documentationLink = document.createElement('a')
					documentationLink.target = '_black'
					documentationLink.href = `https://${href}`
					documentationLink.innerText = `${name} documentation`
					documentationLink.classList.add('documentation-link')
					
					// create the description element of the dropDown
					let description = document.createElement('p')
					description.classList.add('description')
					description.innerText = json.data.description

					// append those elements to the dropDown element
					dropDown.appendChild(documentationLink)
					dropDown.appendChild(description)

					// append the dropDown element to the  fileLine
					fileLine.appendChild(dropDown)

					// add an event listener to the moduleEl.
					// whenever it's clicked, toggled a class 'toggled' on the dropDown element.
					moduleEl.addEventListener('click', e => {
						if (!dropDown.classList.contains('toggled')) {
							dropDown.classList.add('toggled')
						} else {
							dropDown.classList.remove('toggled')
						}
					})
				}).catch(error => {
					console.error('Modoc plugin error:', error)
				})
				// maintain a list of the modules for future purposes.
				modules.push(module)
			}
		}
	})
}

// let builtInModules = [ 'assert', 'buffer', 'child_process', 'cluster', 'console', 'constants', 'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'https', 'module', 'net', 'os', 'path', 'process', 'punycode', 'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'timers', 'tls', 'tty', 'url', 'util', 'v8', 'vm', 'zlib' ]
