export function patchDOM(
    oldNode: Node,
    newNode: Node
): void {
    if (!oldNode || !newNode) return

    if (oldNode.nodeType !== newNode.nodeType || oldNode.nodeName !== newNode.nodeName) {
        if (
            oldNode.nodeType === Node.ELEMENT_NODE ||
            oldNode.nodeType === Node.TEXT_NODE
        ) {
            const replacement = newNode.cloneNode(true)
            preserveState(oldNode as Element, replacement as Element)
            oldNode.replaceWith(replacement)
        }
        return
    }

    if (oldNode.nodeType === Node.TEXT_NODE && newNode.nodeType === Node.TEXT_NODE) {
        const oldText = oldNode as Text
        const newText = newNode as Text

        if (oldText.nodeValue !== newText.nodeValue) {
            oldText.nodeValue = newText.nodeValue
        }
        return
    }

    if (oldNode.nodeType === Node.ELEMENT_NODE && newNode.nodeType === Node.ELEMENT_NODE) {
        const oldEl = oldNode as HTMLElement
        const newEl = newNode as HTMLElement

        // Avoid patching custom elements
        if (customElements.get(oldEl.tagName.toLowerCase())) {
            return
        }

        // Patch data-* attributes
        for (let i = 0; i < newEl.attributes.length; i++) {
            const attr = newEl.attributes[i]
            const oldVal = oldEl.getAttribute(attr.name)
            if (oldVal !== attr.value) {
                oldEl.setAttribute(attr.name, attr.value)
            }
        }

        // Remove old data-* attributes not in newEl
        for (let i = oldEl.attributes.length - 1; i >= 0; i--) {
            const attr = oldEl.attributes[i]
            if (!newEl.hasAttribute(attr.name)) {
                oldEl.removeAttribute(attr.name)
            }
        }

        // Update input values if applicable
        if ((oldEl as HTMLInputElement).value !== (newEl as HTMLInputElement).value) {
            (oldEl as HTMLInputElement).value = (newEl as HTMLInputElement).value
        }

        // Recursively patch children
        const oldChildren = Array.from(oldEl.childNodes)
        const newChildren = Array.from(newEl.childNodes)

        if (oldChildren.length !== newChildren.length ||
            !oldChildren.every((child, i) => child.nodeName === newChildren[i]?.nodeName)) {
            oldEl.innerHTML = ''
            newChildren.forEach(child => oldEl.appendChild(child.cloneNode(true)))
        } else {
            for (let i = 0; i < oldChildren.length; i++) {
                patchDOM(oldChildren[i], newChildren[i])
            }
        }
    }
}

function preserveState(oldEl: Element, newEl: Element) {
    // Preserve scroll and focus state
    const isFocused = document.activeElement === oldEl
    const scrollTop = (oldEl as HTMLElement).scrollTop
    const scrollLeft = (oldEl as HTMLElement).scrollLeft

    if (newEl instanceof HTMLElement) {
        newEl.scrollTop = scrollTop
        newEl.scrollLeft = scrollLeft
        if (isFocused) newEl.focus()
    }
}
