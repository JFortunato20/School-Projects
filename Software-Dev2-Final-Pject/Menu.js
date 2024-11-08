/* menu.js */

function showDetails(title, description, price) {
    document.getElementById('detail-title').textContent = title;
    document.getElementById('detail-description').textContent = description;
    document.getElementById('detail-price').textContent = price;
    document.getElementById('item-details').classList.remove('hidden');
}

function hideDetails() {
    document.getElementById('item-details').classList.add('hidden');
}
