const get_new_row = () => {
    let div = document.createElement("div")
    div.classList.add("row")
    let number = parseInt(document.getElementById("popup").getAttribute("data-row_counter"))
    number++
    div.id = "row_" + number
    document.getElementById("popup").setAttribute("data-row_counter", number)
    return div
}
const get_placeholder = () => {
    let div = document.createElement("div")
    div.style.width = "50px"
    div.style.height = "50px"
    div.style.border = "1px solid red"
    div.id = "placeholder"
    return div
}
const remove_item = (element) => {
    element.parentElement.removeChild(element)
}
// function to place placeholder based on generated position and values
const place_placeholder = (placement) => {
    let shadowRoot = document.getElementById("popup").shadowRoot
    let div = shadowRoot.getElementById("placeholder") ? shadowRoot.getElementById("placeholder") : get_placeholder()
    let content = shadowRoot.getElementById("content")
    let row = null
    if (placement.direction != "inside") {
        if (div.parentElement) {
            if (div.parentElement.classList.contains("row") && div.parentElement.children.length == 1)
                row = div.parentElement
        }
        if (row == null)
            row = get_new_row()
        row.appendChild(div)
    } else {
        if (div.parentElement)
            if (div.parentElement.classList.contains("row") && div.parentElement.children.length == 1)
                remove_item(div.parentElement)
    }
    switch (placement.direction) {
        case "over":
            content.insertBefore(row, placement.element)
            break;
        case "inside":
            if (placement.direction_inside == "right")
                placement.element.insertBefore(div, placement.closest.nextElementSibling)
            else
                placement.element.insertBefore(div, placement.closest)
            break;
        case "under":
            content.insertBefore(row, placement.element.nextElementSibling)
            break;
        case "top":
            content.insertBefore(row, content.firstElementChild)
            break;
        case "bottom":
            content.appendChild(row)
            break;
    }
}
// calculate where item will be placed while moving it
const calculate_placement = (x, y) => {
    let shadowRoot = document.getElementById("popup").shadowRoot
    let content = shadowRoot.getElementById("content")
    let hovered_items = shadowRoot.querySelectorAll(':hover')
    if (hovered_items.length > 0) {
        let height = 0
        for (let element of content.children) {
            if (y > element.getBoundingClientRect().top - parseInt(window.getComputedStyle(element).marginTop) && y < element.getBoundingClientRect().top + element.getBoundingClientRect().height + parseInt(window.getComputedStyle(element).marginBottom)) {
                let element_height = element.getBoundingClientRect().height + parseInt(window.getComputedStyle(element).marginTop) + parseInt(window.getComputedStyle(element).marginBottom)
                let y_offset = y - element.getBoundingClientRect().top + parseInt(window.getComputedStyle(element).marginTop)
                if (y_offset < 0.33 * element_height) {
                    return ({
                        direction: "over",
                        element: element
                    })
                } else if (y_offset < 0.66 * element_height) {
                    let elements_x = Array.from(element.children)
                    let closest = elements_x.reduce(function (prev, curr) {
                        return (Math.abs(curr.getBoundingClientRect().x - x) < Math.abs(prev.getBoundingClientRect().x - x) ? curr : prev);
                    });
                    if (closest.id != "placeholder") {
                        let direction_inside
                        if (x > closest.getBoundingClientRect().x)
                            direction_inside = "right"
                        else
                            direction_inside = "left"
                        return ({
                            direction: "inside",
                            element: element,
                            closest: closest,
                            direction_inside: direction_inside
                        })
                    } else
                        return null
                } else {
                    return ({
                        direction: "under",
                        element: element
                    })
                }
            }
        }
        if (y < content.children[0].getBoundingClientRect().top) {
            return ({
                direction: "top"
            })
        } else {
            return ({
                direction: "bottom"
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
                what.setAttribute("data-template_counter", what.getAttribute("data-template-counter") + 1)
            } else
                item_to_place = element
            shadowRoot.getElementById("placeholder").parentElement.insertBefore(item_to_place, shadowRoot.getElementById("placeholder"))
            remove_item(shadowRoot.getElementById("placeholder"))
        }
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
                .wrapper{
                    max-width: 600px;
                    min-width: 280px;
                    width: 100%;
                    height: 600px;
                }
                .content{
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 15px;
                }
                .row{
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    height: 50px;
                    border: 1px solid red;
                    margin-top: 10px;
                    justify-content: space-evenly;
                }
                `;
            shadow.appendChild(style)
            let wrapper = document.createElement("div")
            wrapper.classList.add("wrapper")
            shadow.appendChild(wrapper)
            let content = document.createElement("div")
            content.classList.add("content")
            content.id = "content"
            wrapper.appendChild(content)
            let row = document.createElement("div")
            row.classList.add("row")
            content.appendChild(row)
            let div = document.createElement("div")
            div.style.border = "1px solid blue"
            div.style.width = "50px"
            div.style.height = "50px"
            row.appendChild(div)
            let div2 = document.createElement("div")
            div2.style.border = "1px solid blue"
            div2.style.width = "50px"
            div2.style.height = "50px"
            row.appendChild(div2)
            let div3 = document.createElement("div")
            div3.style.border = "1px solid blue"
            div3.style.width = "50px"
            div3.style.height = "50px"
            row.appendChild(div3)
            document.getElementById("popup").setAttribute("data-row_counter", this.shadowRoot.querySelectorAll(".row").length)
        }
    }
    customElements.define('popup-container', Popup);
}
initialize()