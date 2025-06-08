export function patchDOM(
    oldNode: Node,
    newNode: Node
): void {
    if (!oldNode || !newNode) return

    // Replace if node types or node names differ
    if (oldNode.nodeType !== newNode.nodeType || oldNode.nodeName !== newNode.nodeName) {
        if (
            oldNode.nodeType === Node.ELEMENT_NODE ||
            oldNode.nodeType === Node.TEXT_NODE
        ) {
            (oldNode as Element | Text).replaceWith(newNode.cloneNode(true))
        }
        return
    }

    // Update text content for text nodes
    if (oldNode.nodeType === Node.TEXT_NODE && newNode.nodeType === Node.TEXT_NODE) {
        const oldText = oldNode as Text
        const newText = newNode as Text

        if (oldText.nodeValue !== newText.nodeValue) {
            oldText.nodeValue = newText.nodeValue
        }

        return
    }

    // Assume ELEMENT_NODE from here
    if (oldNode.nodeType === Node.ELEMENT_NODE && newNode.nodeType === Node.ELEMENT_NODE) {
        const oldEl = oldNode as HTMLElement
        const newEl = newNode as HTMLElement

        // --- NEW: Check for differences in data-* attributes ---
        for (let i = 0; i < newEl.attributes.length; i++) {
            const attr = newEl.attributes[i]
            if (attr.name.startsWith('data-')) {
                const oldVal = oldEl.getAttribute(attr.name)
                if (oldVal !== attr.value) {
                    // Replace whole node if any data-* attribute differs
                    oldEl.replaceWith(newEl.cloneNode(true))
                    return
                }
            }
        }
        // Also check if oldEl has any data-* attribute not present in newEl
        for (let i = 0; i < oldEl.attributes.length; i++) {
            const attr = oldEl.attributes[i]
            if (attr.name.startsWith('data-') && !newEl.hasAttribute(attr.name)) {
                oldEl.replaceWith(newEl.cloneNode(true))
                return
            }
        }

        // Update attributes (non data-* already handled by above check)
        const oldAttrs = oldEl.attributes
        const newAttrs = newEl.attributes

        // Add or update attributes
        for (let i = 0; i < newAttrs.length; i++) {
            const attr = newAttrs[i]
            if (oldEl.getAttribute(attr.name) !== attr.value) {
                oldEl.setAttribute(attr.name, attr.value)
            }
        }

        // Remove old attributes not present in new
        for (let i = 0; i < oldAttrs.length; i++) {
            const attr = oldAttrs[i]
            if (!newEl.hasAttribute(attr.name)) {
                oldEl.removeAttribute(attr.name)
            }
        }

        // Update input value (for inputs inside the element)
        if ((oldEl as HTMLInputElement).value !== (newEl as HTMLInputElement).value) {
            (oldEl as HTMLInputElement).value = (newEl as HTMLInputElement).value
        }

        // Recursively patch children, skipping custom elements
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
