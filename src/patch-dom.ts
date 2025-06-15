export function patchDOM(oldNode: Node, newNode: Node): void {
    if (!oldNode || !newNode) return

    const fadeDuration = 150 // ms

    const fadeOutAndReplace = (oldEl: Element | Text, newEl: Node) => {
        const parent = oldEl.parentElement
        if (!parent) return

        if (oldEl instanceof Element) {
            (oldEl as HTMLElement).style.transition = `opacity ${fadeDuration}ms`;
            (oldEl as HTMLElement).style.opacity = '0'

            setTimeout(() => {
                const clone = newEl.cloneNode(true) as HTMLElement
                clone.style.opacity = '0'
                parent.replaceChild(clone, oldEl)
                requestAnimationFrame(() => {
                    clone.style.transition = `opacity ${fadeDuration}ms`
                    clone.style.opacity = '1'
                })
            }, fadeDuration)
        } else {
            oldEl.replaceWith(newEl.cloneNode(true))
        }
    }

    // Replace node if types/names differ
    if (oldNode.nodeType !== newNode.nodeType || oldNode.nodeName !== newNode.nodeName) {
        if (
            oldNode.nodeType === Node.ELEMENT_NODE ||
            oldNode.nodeType === Node.TEXT_NODE
        ) {
            fadeOutAndReplace(oldNode as Element | Text, newNode)
        }
        return
    }

    // Update text content
    if (oldNode.nodeType === Node.TEXT_NODE && newNode.nodeType === Node.TEXT_NODE) {
        const oldText = oldNode as Text
        const newText = newNode as Text

        if (oldText.nodeValue !== newText.nodeValue) {
            oldText.nodeValue = newText.nodeValue
        }
        return
    }

    // ELEMENT_NODE logic
    if (oldNode.nodeType === Node.ELEMENT_NODE && newNode.nodeType === Node.ELEMENT_NODE) {
        const oldEl = oldNode as HTMLElement
        const newEl = newNode as HTMLElement

        // Check data-* differences
        for (let i = 0; i < newEl.attributes.length; i++) {
            const attr = newEl.attributes[i]
            if (attr.name.startsWith('data-')) {
                const oldVal = oldEl.getAttribute(attr.name)
                if (oldVal !== attr.value) {
                    fadeOutAndReplace(oldEl, newEl)
                    return
                }
            }
        }
        for (let i = 0; i < oldEl.attributes.length; i++) {
            const attr = oldEl.attributes[i]
            if (attr.name.startsWith('data-') && !newEl.hasAttribute(attr.name)) {
                fadeOutAndReplace(oldEl, newEl)
                return
            }
        }

        // Sync attributes
        for (let i = 0; i < newEl.attributes.length; i++) {
            const attr = newEl.attributes[i]
            if (oldEl.getAttribute(attr.name) !== attr.value) {
                oldEl.setAttribute(attr.name, attr.value)
            }
        }
        for (let i = 0; i < oldEl.attributes.length; i++) {
            const attr = oldEl.attributes[i]
            if (!newEl.hasAttribute(attr.name)) {
                oldEl.removeAttribute(attr.name)
            }
        }

        // Update input values
        if ((oldEl as HTMLInputElement).value !== (newEl as HTMLInputElement).value) {
            (oldEl as HTMLInputElement).value = (newEl as HTMLInputElement).value
        }

        // Patch children
        const oldChildren = Array.from(oldEl.childNodes)
        const newChildren = Array.from(newEl.childNodes)

        const childrenMatch =
            oldChildren.length === newChildren.length &&
            oldChildren.every((child, i) => child.nodeName === newChildren[i]?.nodeName)

        if (!childrenMatch) {
            // Smooth replace entire content
            oldEl.style.transition = `opacity ${fadeDuration}ms`
            oldEl.style.opacity = '0'

            setTimeout(() => {
                oldEl.innerHTML = ''
                newChildren.forEach(child => oldEl.appendChild(child.cloneNode(true)))
                oldEl.style.opacity = '1'
            }, fadeDuration)
        } else {
            for (let i = 0; i < oldChildren.length; i++) {
                patchDOM(oldChildren[i], newChildren[i])
            }
        }
    }
}
