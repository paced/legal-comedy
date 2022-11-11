import {
  SELECTOR_FOR_PAGE_NAVIGATION,
  SELECTOR_FOR_ROOT_STATIC_ELEMENT,
  SELECTOR_FOR_TWEETS_CONTAINER,
  SELECTOR_FOR_USER_HEADER_CONTAINER,
} from "./constants";
import {tweetVerifiedSvg, userVerifiedElement} from "./icons";

const addVerifiedElementsToUserPage = (): void => {
  const targetSpan: Element | undefined =
    document.querySelector("div[data-testid='UserName']")?.querySelector("div[dir='auto']")?.children[1];
  if (targetSpan) {
    targetSpan.innerHTML = userVerifiedElement;
  }
};

const addVerifiedElementsToTweets = (): void => {
  [...document.getElementsByTagName("article")].forEach(tweet => {
    const authorText: NodeListOf<Element> = tweet.querySelectorAll("div[dir='auto']");
    if (authorText) {
      authorText[1].innerHTML = tweetVerifiedSvg.trim();
    }
  });
};

const userHeaderObserver = new MutationObserver(() => waitUntilUserPageLoadsThenVerify())
const refreshOrFirstLoadFirstTweetObserver = new MutationObserver(
  () => waitUntilTweetsLoadedThenAddObservers(true, true),
);
const alreadyLoadedFirstTweetObserver = new MutationObserver(
  () => waitUntilTweetsLoadedThenAddObservers(false, true),
);
const pageNavigationObserver = new MutationObserver(() => handlePageChange());
const lazyLoadObserver = new MutationObserver(addVerifiedElementsToTweets);

const waitUntilUserPageLoadsThenVerify = (): void => {
  // Also needs to disconnect if the page isn't for the user.

  const targetElement = document.querySelector(SELECTOR_FOR_USER_HEADER_CONTAINER);
  if (targetElement) {
    addVerifiedElementsToUserPage();

    userHeaderObserver.disconnect();
  }
};

const waitUntilTweetsLoadedThenAddObservers = (
  addPageNavigationObserver: boolean, addLazyLoadObserver: boolean,
): void => {
  // Page load observer must remain in edge case: user repeatedly goes back and forth between pages.

  const targetElement = document.querySelector(SELECTOR_FOR_TWEETS_CONTAINER);
  if (
    targetElement
    && targetElement.childElementCount > 0
    && targetElement.children[0].getAttribute("data-testid") === "cellInnerDiv"
  ) {
    if (addPageNavigationObserver) {
      pageNavigationObserver.observe(document.querySelector(SELECTOR_FOR_PAGE_NAVIGATION)!, {childList: true});
    }

    if (addLazyLoadObserver) {
      lazyLoadObserver.observe(document.querySelector(SELECTOR_FOR_TWEETS_CONTAINER)!, {childList: true});
    }

    addVerifiedElementsToTweets();

    userHeaderObserver.disconnect();
    refreshOrFirstLoadFirstTweetObserver.disconnect();
    alreadyLoadedFirstTweetObserver.disconnect();
  }
};

const handlePageChange = (): void => {
  userHeaderObserver.disconnect();
  userHeaderObserver.observe(
    document.querySelector(SELECTOR_FOR_ROOT_STATIC_ELEMENT)!, {childList: true, subtree: true}
  );

  alreadyLoadedFirstTweetObserver.disconnect();
  alreadyLoadedFirstTweetObserver.observe(
    document.querySelector(SELECTOR_FOR_ROOT_STATIC_ELEMENT)!, {childList: true, subtree: true}
  );
};

userHeaderObserver.observe(
  document.querySelector(SELECTOR_FOR_ROOT_STATIC_ELEMENT)!, {childList: true, subtree: true},
);

refreshOrFirstLoadFirstTweetObserver.observe(
  document.querySelector(SELECTOR_FOR_ROOT_STATIC_ELEMENT)!, {childList: true, subtree: true}
);
