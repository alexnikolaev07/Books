// test.js
     const { JSDOM } = require("jsdom");
     const fs = require("fs");
     const path = require("path");

const html = fs.readFileSync(path.resolve(__dirname, '../public/index.html'), 'utf8');

describe("script.js Tests", () => {
    let dom;
    let document;

    beforeEach(() => {
        dom = new JSDOM(html, {
            resources: "usable",
            runScripts: "dangerously"
        });

        document = dom.window.document;

        return new Promise((resolve, reject) => {
            dom.window.addEventListener('DOMContentLoaded', () => {
                resolve();
            });
        });
    });

    test("Should allow filtering by genre", () => {
        const genreSelect = document.getElementById('genreSelect');
        genreSelect.value = 'Fiction'; 
        genreSelect.dispatchEvent(new dom.window.Event('change'));

        const filteredBooks = document.querySelectorAll('.book-item');
        filteredBooks.forEach(book => {
            expect(book.querySelector('.book-info p').textContent).toContain('Fantasy');
        });
    });

    test("Should allow search by book name", () => {
        const searchInput = document.getElementById('searchInput');
        searchInput.value = 'JavaScript'; 
        searchInput.dispatchEvent(new dom.window.Event('input'));

        const filteredBooks = document.querySelectorAll('.book-item');
        filteredBooks.forEach(book => {
            expect(book.querySelector('h4').textContent.toLowerCase()).toContain('javascript');
        });
    });

    test("Should allow search by author name", () => {
        const authorSearchInput = document.getElementById('authorSearchInput');
        authorSearchInput.value = 'Gogol Nick'; 
        authorSearchInput.dispatchEvent(new dom.window.Event('input'));

        const filteredBooks = document.querySelectorAll('.book-item');
        filteredBooks.forEach(book => {
            expect(book.querySelector('p:nth-child(2)').textContent.toLowerCase()).toContain('gogol nick');
        });
    });

    test("Should visualize AVL tree correctly", () => {
       const visualizationContainer = document.getElementById('avl-tree-visualization');
       expect(visualizationContainer.innerHTML).not.toBe('');

       const nodes = visualizationContainer.querySelectorAll('.tree-node');
       nodes.forEach(node => {
           expect(node.style.left).toMatch(/px/);
           expect(node.style.top).toMatch(/px/);
       });

       const lines = visualizationContainer.querySelectorAll('.tree-line');
       lines.forEach(line => {
           expect(line.style.width).toMatch(/px/);
           expect(line.style.transform).toMatch(/rotate\(-?\d+deg\)/);
       });
    });
    
});
