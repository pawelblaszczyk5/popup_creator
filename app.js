const get_new_row = () => {
    let div = document.createElement("div")
    div.classList.add("row")
    div.id = "row" + document.getElementById("popup").shadowRoot.getElementsByClassName("row")
    return div
}
const place = (placement) => {
    console.log(placement)
    if (placement.direction != inside)
        let row = get_new_row()
    // test
    switch (placement.direction) {
        case "over":
            break;
        case "inside":
            break;
        case "under":
            break;
        case "top":
            break;
        case "bottom":
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
                    return ({
                        direction: "inside",
                        element: element
                    })
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
    }
    const move = function (e) {

        e.preventDefault();
        element.style.left = e.clientX + 10 + "px"
        element.style.top = e.clientY + 10 + "px"
        calculate_placement(e.clientX, e.clientY)
        let placement = calculate_placement(e.clientX, e.clientY)
        if (placement) {
            place({
                ...placement,
                what: what
            })
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
        }
    }
    customElements.define('popup-container', Popup);
}
initialize()