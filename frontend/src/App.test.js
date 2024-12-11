System.register(["react", "@testing-library/react", "./App"], function (exports_1, context_1) {
    "use strict";
    var react_1, react_2, App_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (react_1_1) {
                react_1 = react_1_1;
            },
            function (react_2_1) {
                react_2 = react_2_1;
            },
            function (App_1_1) {
                App_1 = App_1_1;
            }
        ],
        execute: function () {
            test('renders learn react link', () => {
                react_2.render(<App_1.default />);
                const linkElement = react_2.screen.getByText(/learn react/i);
                expect(linkElement).toBeInTheDocument();
            });
        }
    };
});
