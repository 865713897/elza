export type MatcherStrategy = (item: string | RegExp, path: string) => boolean;

class PathMatcher {
  private strategies: MatcherStrategy[] = [];

  constructor(matchers: MatcherStrategy[]) {
    this.strategies = matchers;
  }

  addMatcher(matcher: MatcherStrategy) {
    this.strategies.push(matcher);
  }

  match(item: string | RegExp, path: string): boolean {
    return this.strategies.some((strategy) => strategy(item, path));
  }
}

export default PathMatcher;
