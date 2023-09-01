class PathMatcher {
    constructor(matchers) {
        this.strategies = [];
        this.strategies = matchers;
    }
    addMatcher(matcher) {
        this.strategies.push(matcher);
    }
    match(item, path) {
        return this.strategies.some((strategy) => strategy(item, path));
    }
}
export default PathMatcher;
