export function patchDOM(
    oldNode: Node,
    newNode: Node
): void {
    if (!oldNode || !newNode)

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

    // If we're here, assume ELEMENT_NODEs
    if (oldNode.nodeType === Node.ELEMENT_NODE && newNode.nodeType === Node.ELEMENT_NODE) {
        const oldEl = oldNode as HTMLElement
        const newEl = newNode as HTMLElement

        // Update attributes
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
