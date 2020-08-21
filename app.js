let settings = {
    editing: null,
    width: 600,
    height: 600,
}
const picker1 = new JSColor(document.getElementById("colorPicker1"), {
    'format': 'rgba',
})
const picker2 = new JSColor(document.getElementById("btn_color"), {
    'format': 'hex',
})
const get_new_row = () => {
    let div = document.createElement("div")
    div.classList.add("row")
    return div
}
const clean_rows = () => {
    let shadowRoot = document.getElementById("popup").shadowRoot
    for (let element of shadowRoot.querySelectorAll(".row")) {
        element.removeAttribute("style")
        if (element.children.length == 0)
            remove_item(element)
    }
}
const get_placeholder = () => {
    let div = document.createElement("div")
    div.style.width = "30px"
    div.style.height = "30px"
    div.style.border = "1px solid red"
    div.id = "placeholder"
    return div
}
const remove_item = (element) => {
    element.parentElement.removeChild(element)
}
const add_style = (style, value, selector) => {
    let shadowRoot = document.getElementById("popup").shadowRoot
    let selected_rule
    for (let rule of shadowRoot.styleSheets[0].rules) {
        if (rule.selectorText == selector) {
            selected_rule = rule
            break
        }
    }
    if (selected_rule == null) {
        shadowRoot.styleSheets[0].insertRule(`${selector}{}`, shadowRoot.styleSheets[0].rules.length - 2)
        selected_rule = shadowRoot.styleSheets[0].rules[shadowRoot.styleSheets[0].rules.length - 3]
    }
    selected_rule.style[style] = value
}
const add_to_media = (style, value, selector, width) => {
    let shadowRoot = document.getElementById("popup").shadowRoot
    let media
    let selected_rule
    for (let rule of shadowRoot.styleSheets[0].rules) {
        if (rule.conditionText)
            if (rule.conditionText.indexOf(width + "px") != -1)
                media = rule
    }
    for (let rule of media.cssRules) {
        if (rule.selectorText == selector) {
            selected_rule = rule
            break
        }
    }
    if (selected_rule == null) {
        media.insertRule(`${selector}{}`, media.cssRules.length)
        selected_rule = media.cssRules[(media.cssRules.length) - 1]
    }
    selected_rule.style[style] = value
}
const add_attribute = (attribute, value, element) => {
    let shadowRoot = document.getElementById("popup").shadowRoot
    shadowRoot.querySelector(element).setAttribute(attribute, value)

}
// function to place placeholder based on generated position and values
const place_placeholder = (placement) => {
    let shadowRoot = document.getElementById("popup").shadowRoot
    let div = shadowRoot.getElementById("placeholder") ? shadowRoot.getElementById("placeholder") : get_placeholder()
    let content = shadowRoot.getElementById("content")
    let row = null
    if (placement.direction != "inside") {
        row = get_new_row()
        row.appendChild(div)
    } else if (div.id == "placeholder" && div.parentElement) {
        div.parentElement.style.height = div.parentElement.getBoundingClientRect().height + "px"
    }
    switch (placement.direction) {
        case "over":
            content.insertBefore(row, placement.element)
            break
        case "inside":
            if (placement.direction_inside == "right")
                placement.element.insertBefore(div, placement.closest.nextElementSibling)
            else
                placement.element.insertBefore(div, placement.closest)
            break
        case "under":
            content.insertBefore(row, placement.element.nextElementSibling)
            break
        case "in":
            content.appendChild(row)
            break
    }
    if (placement.direction != "inside") {
        clean_rows()
    }
}
// calculate where item will be placed while moving it
const calculate_placement = (x, y) => {
    let shadowRoot = document.getElementById("popup").shadowRoot
    let content = shadowRoot.getElementById("content")
    let hovered_items = shadowRoot.querySelectorAll(':hover')
    if (hovered_items.length > 0) {
        let elements_y = Array.from(content.children)
        if (elements_y.length != 0) {
            let closest_y = elements_y.reduce(function (prev, curr) {
                return (Math.abs((curr.getBoundingClientRect().y + (curr.getBoundingClientRect().height / 2)) - y) < Math.abs((prev.getBoundingClientRect().y + (prev.getBoundingClientRect().height / 2)) - y) ? curr : prev)
            })
            if (y < closest_y.getBoundingClientRect().y + (closest_y.getBoundingClientRect().height / 4))
                return ({
                    direction: "over",
                    element: closest_y
                })
            else if (y > closest_y.getBoundingClientRect().y + ((closest_y.getBoundingClientRect().height / 4) * 3)) {
                return ({
                    direction: "under",
                    element: closest_y
                })
            } else {
                let elements_x = Array.from(closest_y.children)
                let closest = elements_x.reduce(function (prev, curr) {
                    return (Math.abs((curr.getBoundingClientRect().x + (curr.getBoundingClientRect().width / 2)) - x) < Math.abs((prev.getBoundingClientRect().x + (prev.getBoundingClientRect().width / 2)) - x) ? curr : prev)
                })
                if (closest.id != "placeholder") {
                    let direction_inside
                    if (x > (closest.getBoundingClientRect().x + (closest.getBoundingClientRect().width / 2)))
                        direction_inside = "right"
                    else
                        direction_inside = "left"
                    return ({
                        direction: "inside",
                        element: closest_y,
                        closest: closest,
                        direction_inside: direction_inside
                    })
                } else
                    return null
            }
        } else {
            return ({
                direction: "in"
            })
        }
    }
    if (shadowRoot.getElementById("placeholder")) {
        if (shadowRoot.getElementById("placeholder").parentElement.children.length == 1) {
            let row = shadowRoot.getElementById("placeholder").parentElement
            remove_item(shadowRoot.getElementById("placeholder"))
            remove_item(row)
        } else
            remove_item(shadowRoot.getElementById("placeholder"))
    }
}
const del = (element) => {
    for (let elem of document.getElementsByClassName("label-element"))
        elem.style.display = !elem.classList.contains("label-null") ? "none" : "flex"
    for (let elem of document.getElementById("row_settings").children) {
        if (elem.classList.contains("panel__warning"))
            elem.style.display = "flex"
        else
            elem.style.display = "none"
    }
    remove_item(element)
    settings.editing = null
}
const edit = (element) => {
    let shadowRoot = document.getElementById("popup").shadowRoot
    document.getElementById("element_settings--trigger").click()
    if (!settings.editing || element.parentElement != settings.editing.parentElement) {
        for (let elem of document.getElementsByClassName("input--row")) {
            if (elem.getAttribute("data-what") == "style") {
                let value = window.getComputedStyle(element.parentElement)[elem.getAttribute("data-name")]
                let prefix = elem.getAttribute("data-prefix")
                let prefix_index = prefix ? value.indexOf(prefix) : 0
                let sufix = elem.getAttribute("data-sufix")
                let sufix_index = sufix ? value.indexOf(sufix) : value.length - 1
                value = window.getComputedStyle(element.parentElement)[elem.getAttribute("data-name")].substring(prefix_index, sufix_index)
                elem.value = value
            } else if (elem.tagName == "SELECT")
                for (let i = 0; i < elem.children.length; i++)
                    if (elem.children[i].value == window.getComputedStyle(element.parentElement)[elem.getAttribute("data-name")])
                        elem.selectedIndex = i
        }
    }
    settings.editing = element
    let template = element.id.substring(0, element.id.indexOf("_"))
    document.getElementById("wysiwyg_content").contentEditable = template == "p" ? true : false
    if (template == "p")
        document.getElementById("wysiwyg_content").innerHTML = element.innerHTML
    for (let elem of document.getElementsByClassName("label-element"))
        elem.style.display = !elem.classList.contains("label-" + template) ? "none" : "flex"
    for (let elem of document.getElementsByClassName("input--element")) {
        element = elem.getAttribute("data-editing_sufix") ? shadowRoot.querySelector("#" + settings.editing.id + " " + elem.getAttribute("data-editing_sufix")) : settings.editing
        if (elem.parentElement.style.display == "flex") {
            if (elem.tagName == "SELECT" && elem.getAttribute("data-what") == "style") {
                for (let i = 0; i < elem.children.length; i++)
                    if (elem.children[i].value == window.getComputedStyle(element)[elem.getAttribute("data-name")])
                        elem.selectedIndex = i
            } else if (elem.tagName == "SELECT" && elem.getAttribute("data-what") == "attribute") {
                for (let i = 0; i < elem.children.length; i++)
                    if (elem.children[i].value == element.getAttribute(elem.getAttribute("data-name")))
                        elem.selectedIndex = i
            } else if (elem.getAttribute("data-what") == "style") {
                let value = window.getComputedStyle(element)[elem.getAttribute("data-name")]
                let prefix = elem.getAttribute("data-prefix")
                let prefix_index = prefix ? value.indexOf(prefix) : 0
                let sufix = elem.getAttribute("data-sufix")
                let sufix_index = sufix ? value.indexOf(sufix) : value.length - 1
                value = window.getComputedStyle(element)[elem.getAttribute("data-name")].substring(prefix_index, sufix_index)
                elem.value = value
            } else if (elem.getAttribute("data-what") == "attribute") {
                elem.value = element.getAttribute(elem.getAttribute("data-name"))
            } else if (elem.getAttribute("data-what") == "hide")
                elem.checked = element.classList.contains("mobile_hide")
        }
    }
    for (let elem of document.getElementById("row_settings").children) {
        if (!elem.classList.contains("panel__warning"))
            elem.style.display = "flex"
        else
            elem.style.display = "none"
    }
}
// function to drag elements around
const drag = function (e) {
    let element = this.cloneNode(true);
    let what = this
    document.body.appendChild(element)
    element.style.position = "absolute"
    element.style.left = e.clientX + "px"
    element.style.top = e.clientY + "px"
    element.style.width = this.getBoundingClientRect().width + "px"
    element.style.height = this.getBoundingClientRect().height + "px"
    element.style.borderColor = "black"
    element.style.color = "black"

    if (!what.classList.contains("draggable_item")) {
        let trash = document.createElement("div")
        trash.style.width = "80px"
        trash.style.height = "80px"
        trash.style.backgroundColor = 'rgba(255, 0, 0, 0.2)'
        trash.style.position = "absolute"
        trash.style.left = "0px"
        trash.style.top = "0px"
        trash.id = "trash"
        document.body.appendChild(trash)
    }
    const up = function (e) {
        e.preventDefault();
        window.removeEventListener("mousemove", move)
        window.removeEventListener("mouseup", up)
        element.parentElement.removeChild(element)
        let shadowRoot = document.getElementById("popup").shadowRoot
        if (shadowRoot.getElementById("placeholder")) {
            let item_to_place
            if (what.classList.contains("draggable_item")) {
                item_to_place = document.importNode(document.getElementById(what.getAttribute("data-template_id")).content, true)
                item_to_place = item_to_place.children[0]
                item_to_place.id = what.getAttribute("data-template_id") + "_" + what.getAttribute("data-template_counter")
                item_to_place.classList.add(what.getAttribute("data-template_id"))
                what.setAttribute("data-template_counter", what.getAttribute("data-template-counter") + 1)
                item_to_place.addEventListener("click", function (e) {
                    edit(this)
                })
                if (what.getAttribute("data-template_id") == "input") {
                    item_to_place.addEventListener("input", (e) => {
                        e.preventDefault()
                    })
                }
                item_to_place.addEventListener("dblclick", drag)
            } else
                item_to_place = what
            shadowRoot.getElementById("placeholder").parentElement.insertBefore(item_to_place, shadowRoot.getElementById("placeholder"))
            if (!shadowRoot.getElementById("placeholder").parentElement.id) {
                let number = parseInt(document.getElementById("popup").getAttribute("data-row_counter"))
                number++
                shadowRoot.getElementById("placeholder").parentElement.id = "row_" + number
                document.getElementById("popup").setAttribute("data-row_counter", number)
            }
            remove_item(shadowRoot.getElementById("placeholder"))
        } else {
            if (!what.classList.contains("draggable_item"))
                if (Array.from(document.querySelectorAll(":hover")).indexOf(trash) != -1)
                    del(what)
        }
        if (document.getElementById("trash"))
            remove_item(document.getElementById("trash"))
        clean_rows()
    }
    const move = function (e) {
        e.preventDefault();
        element.style.left = e.clientX + 10 + "px"
        element.style.top = e.clientY + 10 + "px"
        calculate_placement(e.clientX, e.clientY)
        let placement = calculate_placement(e.clientX, e.clientY)
        if (placement) {
            place_placeholder(placement)
        }
    }
    window.addEventListener("mouseup", up)
    window.addEventListener("mousemove", move)
}
const initialize = () => {
    //generate list of draggable elements
    let tools = document.getElementById("tools")
    for (let element of document.getElementsByClassName("template")) {
        let div = document.createElement("div")
        div.className = "draggable_item"
        div.textContent = "P"
        div.setAttribute("data-template_id", element.id)
        div.setAttribute("data-template_counter", 0)
        tools.appendChild(div)
        div.addEventListener("mousedown", drag)
    }

    //collapse and expand toolbar with draggable elements
    let toolbar = document.getElementById("toolbar")
    document.getElementById("open_toolbar_button").addEventListener("click", () => {
        if (toolbar.classList.contains("left__toolbar--open"))
            toolbar.classList.remove("left__toolbar--open")
        else
            toolbar.classList.add("left__toolbar--open")
    })

    // toggle settings panels
    document.getElementById("global_settings").style.display = "flex"
    for (let element of document.getElementsByClassName("panel__mark")) {
        element.addEventListener("click", function () {
            if (!this.classList.contains("panel__mark--clicked")) {
                document.getElementById(document.getElementsByClassName("panel__mark--clicked")[0].getAttribute("data-which_panel")).style.display = "none"
                document.getElementsByClassName("panel__mark--clicked")[0].classList.remove("panel__mark--clicked")
                this.classList.add("panel__mark--clicked")
                document.getElementById(this.getAttribute("data-which_panel")).style.display = "flex"
            }
        })
    }

    // create shadow dom and give it basic styles
    class Popup extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({
                mode: 'open'
            })
            const style = document.createElement('style');
            style.textContent = `
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                #wrapper{
                    max-width: 600px;
                    min-width: 280px;
                    width: 100%;
                    height: 600px;
                }
                #content::before{
                    content: "";
                    display: block;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                    position: absolute;
                    z-index: -5;
                }
                #content{
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background-repeat: no-repeat;
                }
                .row{
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    border: 1px solid red;
                    justify-content: space-evenly;
                    align-items: center;
                }
                .img img{
                    display: block;
                    width: 100%;
                    height: 100%;
                }
                .p{
                    font-size: 16rem;
                }
                .input--text{
                    padding: 7px;
                    border-radius: 0;
                    border: 1px solid black;
                    background-color: #ffffff;
                }
                ::placeholder{
                    color: #8e8e8e;
                }
                /* Customize the label (the container) */
                .container {
                    display: block;
                    position: relative;
                    padding-left: 28px;
                    cursor: pointer;
                    font-size: 16rem;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                }
                .container input {
                    position: absolute;
                    opacity: 0;
                    cursor: pointer;
                    height: 0;
                    width: 0;
                }
                .checkmark {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 20px;
                    width: 20px;
                    background-color: #fff;
                    border: 1px solid black;
                }
                .checkmark::after {
                    content: "";
                    position: absolute;
                    display: none;
                }
                .container input:checked ~ .checkmark::after {
                    display: block;
                }
                .container .checkmark::after {
                    left: 6px;
                    top: 3px;
                    width: 4px;
                    height: 9px;
                    border: solid black;
                    border-width: 0 3px 3px 0;
                    -webkit-transform: rotate(45deg);
                    -ms-transform: rotate(45deg);
                    transform: rotate(45deg);
                }
                .input--submit{
                    background: #fff;
                    border: 1px solid black;
                    border-radius: 0;
                    padding: 5px 15px;
                }
                @media screen and (max-width: 500px)
                {
                    .mobile_hide {
                        display: none;
                    }
                }
                @media screen and (max-width: 280px)
                {

                }
                `;
            shadow.appendChild(style)
            let wrapper = document.createElement("div")
            wrapper.id = "wrapper"
            shadow.appendChild(wrapper)
            let content = document.createElement("div")
            content.id = "content"
            wrapper.appendChild(content)
            document.getElementById("popup").setAttribute("data-row_counter", this.shadowRoot.querySelectorAll(".row").length)

        }
    }
    customElements.define('popup-container', Popup);
    for (let element of document.getElementsByClassName("input--standard")) {
        element.addEventListener("input", (e) => {
            let input = e.target
            let shadowRoot = document.getElementById("popup").shadowRoot
            if (input.checkValidity()) {
                let editing = input.getAttribute("data-editing")
                if (editing == null && settings.editing != null)
                    editing = "#" + settings.editing.id
                if (editing == null)
                    return false
                if (input.getAttribute("data-editing_sufix") == "img")
                    editing += " img"
                let value = (input.getAttribute("data-prefix") || "") + input.value + (input.getAttribute("data-sufix") || "")
                if ((input.getAttribute("data-name") == "height" || input.getAttribute("data-name") == "width") && input.value == "" && !input.getAttribute("data-editing"))
                    value = "auto"
                switch (input.getAttribute("data-what")) {
                    case "style":
                        add_style(input.getAttribute("data-name"), value, editing)
                        break
                    case "attribute":
                        add_attribute(input.getAttribute("data-name"), value, editing)
                        if (value == "sm-form-name")
                            add_attribute("type", "text", editing)
                        else if (value == "sm-form-phone")
                            add_attribute("type", "tel", editing)
                        else if (value == "sm-form-mail")
                            add_attribute("type", "email", editing)
                        else if (value == "sm-form-company")
                            add_attribute("type", "text", editing)
                        if (value == "sm-form-name" || value == "sm-form-phone" || value == "sm-form-mail" || value == "sm-form-company")
                            shadowRoot.querySelector(editing).value = ""
                        break
                }
                if (editing == "#" + shadowRoot.getElementById("wrapper").id && input.getAttribute("data-name") == "maxWidth") {
                    document.getElementById("popup").style.width = input.value + "px"
                    settings.width = input.value
                } else if (editing == shadowRoot.getElementById("wrapper") && input.getAttribute("data-name") == "height") {
                    document.getElementById("popup").style.height = input.value + "px"
                    settings.height = input.value
                }
            }
        })
    }
    for (let element of document.getElementsByClassName("input--filter")) {
        element.addEventListener("input", (e) => {
            let opacity = 100 - document.getElementById("bg_opacity").value
            let grayscale = document.getElementById("bg_grayscale").value
            let brightness = document.getElementById("bg_brightness").value
            let blur = document.getElementById("bg_blur").value
            let filter_string = `blur(${blur}px) grayscale(${grayscale}%) opacity(${opacity}%) brightness(${brightness}%)`
            add_style("filter", filter_string, "#content::before")
        })
    }
    for (let element of document.getElementsByClassName("input--row")) {
        element.addEventListener("input", (e) => {
            let input = e.target
            if (input.checkValidity()) {
                let editing
                if (settings.editing != null)
                    editing = "#" + settings.editing.parentElement.id
                else
                    return false
                let value = (input.getAttribute("data-prefix") || "") + input.value + (input.getAttribute("data-sufix") || "")
                switch (input.getAttribute("data-what")) {
                    case "style":
                        add_style(input.getAttribute("data-name"), value, editing)
                        break
                    case "attribute":
                        break
                }
            }
        })
    }
    for (let element of document.getElementsByClassName("input--checkbox")) {
        element.addEventListener("input", (e) => {
            if (settings.editing != null) {
                if (e.target.getAttribute("data-what") == "hide")
                    settings.editing.classList.toggle("mobile_hide")
                else if (e.target.getAttribute("data-what") == "required") {
                    if (e.target.checked)
                        settings.editing.setAttribute("required", "")
                    else
                        settings.editing.removeAttribute("required")
                }
            }
        })
    }
}
initialize();

// wysiwyg function 
(function () {
    document.execCommand("styleWithCSS", false, true)
    let wysiwyg = document.getElementById("wysiwyg_content")
    wysiwyg.addEventListener("input", () => {
        if (wysiwyg.textContent.length == 0)
            document.execCommand("fontSize", false, "1")
        const change_font = () => {
            let fontElements = window.getSelection().anchorNode.parentNode
            if (fontElements.style.fontSize == "x-small") {
                if (document.getElementById("select_fontsize").value != "none")
                    fontElements.style.fontSize = document.getElementById("select_fontsize").value + "rem"
                else
                    fontElements.style.fontSize = 16 + "rem"
            }
            if (settings.editing.classList.contains("p"))
                settings.editing.innerHTML = wysiwyg.innerHTML
            wysiwyg.removeEventListener("input", change_font)
        }
        wysiwyg.addEventListener("input", change_font)
        wysiwyg.focus()
    })
    wysiwyg.addEventListener("input", () => {
        if (settings.editing.classList.contains("p"))
            settings.editing.innerHTML = wysiwyg.innerHTML
    })
    document.getElementById("btn_bold").addEventListener("click", () => {
        wysiwyg.focus()
        document.execCommand("bold", false, true)
        wysiwyg.focus()
    })
    document.getElementById("btn_italic").addEventListener("click", () => {
        wysiwyg.focus()
        document.execCommand("italic", false, true)
        wysiwyg.focus()
    })
    document.getElementById("select_fontsize").addEventListener("input", (e) => {
        if (e.target.value != "none") {
            wysiwyg.focus()
            document.execCommand("fontSize", false, "1");
            const change_font = () => {
                let fontElements = window.getSelection().anchorNode.parentNode
                if (fontElements.style.fontSize == "x-small") {
                    fontElements.style.fontSize = e.target.value + "rem"
                }
                wysiwyg.removeEventListener("input", change_font)
                if (settings.editing.classList.contains("p"))
                    settings.editing.innerHTML = wysiwyg.innerHTML
            }
            wysiwyg.addEventListener("input", change_font)
            wysiwyg.focus()
        } else {
            wysiwyg.focus()
        }
    })
    document.getElementById("btn_strike").addEventListener("click", () => {
        wysiwyg.focus()
        document.execCommand("strikeThrough", false, true)
        wysiwyg.focus()
    })
    document.getElementById("btn_underline").addEventListener("click", () => {
        wysiwyg.focus()
        document.execCommand("underline", false, true)
        wysiwyg.focus()
    })
    document.getElementById("btn_ordered").addEventListener("click", () => {
        wysiwyg.focus()
        document.execCommand("insertOrderedList", false, true)
        wysiwyg.focus()
    })
    document.getElementById("btn_unordered").addEventListener("click", () => {
        wysiwyg.focus()
        document.execCommand("insertUnorderedList", false, true)
        wysiwyg.focus()
    })
    document.getElementById("btn_indent").addEventListener("click", () => {
        wysiwyg.focus()
        document.execCommand("indent", false, true)
        wysiwyg.focus()
    })
    document.getElementById("btn_outdent").addEventListener("click", () => {
        wysiwyg.focus()
        document.execCommand("outdent", false, true)
        wysiwyg.focus()
    })
    document.getElementById("btn_color").addEventListener('input', (e) => {
        wysiwyg.focus()
        picker2.hide()
        document.execCommand("foreColor", false, e.target.value)
        wysiwyg.focus()
    })
    document.getElementById("btn_href").addEventListener('click', (e) => {
        document.getElementById("href_modal").style.display = "flex"
    })
    document.getElementById("btn_addhref").addEventListener('click', (e) => {
        if (document.getElementById("wysiwyg_href").checkValidity()) {
            wysiwyg.focus()
            document.execCommand("createLink", false, document.getElementById("wysiwyg_href").value)
            document.getElementById("href_modal").style.display = "none"
            document.getElementById("wysiwyg_href").value = ""
            let hrefElement = window.getSelection().anchorNode.parentNode
            hrefElement.target = "_blank"
            wysiwyg.focus()
        }
    })
    document.getElementById("select_fontname").addEventListener('input', (e) => {
        if (e.target.value != "none") {
            wysiwyg.focus()
            document.execCommand("fontName", false, e.target.value)
            wysiwyg.focus()
        }
    })
    document.getElementById("btn_justifyleft").addEventListener("click", () => {
        wysiwyg.focus()
        document.execCommand("justifyLeft", false, null)
        wysiwyg.focus()
    })
    document.getElementById("btn_justifycenter").addEventListener("click", () => {
        wysiwyg.focus()
        document.execCommand("justifyCenter", false, null)
        wysiwyg.focus()
    })
    document.getElementById("btn_justifyright").addEventListener("click", () => {
        wysiwyg.focus()
        document.execCommand("justifyRight", false, null)
        wysiwyg.focus()
    })
    document.getElementById("btn_justifyfull").addEventListener("click", () => {
        wysiwyg.focus()
        document.execCommand("justifyFull", false, null)
        wysiwyg.focus()
    })
})();