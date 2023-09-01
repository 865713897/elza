export type MatcherStrategy = (item: string | RegExp, path: string) => boolean;
declare class PathMatcher {
    private strategies;
    constructor(matchers: MatcherStrategy[]);
    addMatcher(matcher: MatcherStrategy): void;
    match(item: string | RegExp, path: string): boolean;
}
export default PathMatcher;
