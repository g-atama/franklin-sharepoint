# Purpose / Architecture

The purpose of this repository is to provide a sandbox to experiment with infrastructure and would be compatible with Franklin / AEM (I'll just say AEM from here forward) patterns and principles.

## Core Principles

Therea are a few core ideas that I think should guide anything we do. These are based on my understanding of AEM and what it is intending to do.

## Explaining the less is more approach to customers in a good way seems important

The benefit of the patterns AEM seems to be going for are the familiarity and ease that users can author content. Less magic. Work with tools you know. But that simplicity comes at the trade off of being able to do whatever you want. Helping clients understand this from the start seems like it will be important to set expectations.  

### Prime Directive: Everything must be fast - Speed is 100% critical

Whatever we do has to be fast, because it will happen on the client side (e.g. in a users browser). This means that everything should be cached, and anything that is not cached should have a very fast response time.

Efectively and _creatively_ using cache features (both of the browser and CDN) will be really important. For example utilizing "stale while revalidate" and async refreshing of cache.


### Opt for simplicity and guiderails over complexity and flexibility

Of course offering flexibility is great, but it seems that offering guide rails, fast and _consistent_ performance should be prioritized over features and flexibility. This is pretty core to AEM, to an extreme degree I'd argue (your only database is Google Docs / Word / Sharepoint!). Encouraging creativity with a limited set of reliable tools is the way to go.

### Use SideKick customization / create plugin(s)

I have mixed feelings about the SideKick so far, but it seems like the best place to consider adding functionality to AEM.

https://www.aem.live/developer/sidekick-customization

https://github.com/adobe/helix-sidekick-extension/blob/main/docs/API.md#SidekickConfig

### Understand page AEM lifecycle and expect requests from block JavaScript

In general it will be block JavaScript making requests for any additional data / functionality. This isn't perhaps so interesting in itself, but I just think it's good to visualize this and keep in mind when thinking about functionality because it really drives home the fact that speed is important. 

### Take full advantage the "hacks" that AEM recommends

**The first choice should probably be trying to get data into Drive / SharePoint, vs serving it externally**

In order to offer something useful AND quality that plays well with AEM, understanding some of the (what I'll call) hacks that AEM recommends is going to be important. Basically trying to think creativily about how to do things within the limited constraints of AEM and Google Drive / SharePoint / Office.

For example, writing importers that import excel spreadsheets of product data into Google Drive and serve that data as JSON which a block's javascript can then query to show additional product data or dynamic product data.

Related to the above, the fallback system for offering fallback pages when something is missing (this is perhaps similar to the concept of "overlays" in traditional AEM).

### Be careful of security and following best practices

"Trusted Types" (a new feature / best practice for browser security, specifically to mitigate XSS attacks) _could_ be important to understand or at least be aware of. Certain types of DOM manipulation may become more difficult or even impossible depending on Trusted Types configuration. This is likely not a huge concern but something to be aware or think about in order to be on top of our game.

### Become comfortable with longer TTLs

Get comfortable saying "This data will update every 15 minutse". The importance of performance means relying on cache, potentially layers of cache, so being comfortable with this vs expecting real time feedback seems good.

Note that in ways this is counter to a big part of AEM, which is rather than caching things are happening on the client side... for content coming from AEM cache invalidaton at the CDN will happen but for data coming from third party systems that don't have the benefit of 


## Ideas

### Use SideKick to target where an Atama composed "block" should be inserted

Something like

1. Have Atama "block" run as top level block, possibly in header
2. Target specific block or part of page to insert data
3. Insert markdown in appropriate places
4. Iterate over blocks to give them a chance to work on new markdown?

RE: #4, I guess the idea could be to insert "simple" and pristine markup, e.g. simple tags h1, ul, li, p, strong, em, etc and apply the correct classes, then figure out how to make the AEM blocks look at this client side generated markup. 

The difference here vs something more bespoke is that you'd be re-using the same block logic and styles used on other parts of the AEM side. Otherwise you might create a block that gets some data from an API, then applies styles and renders that you'd be writing code specifically for that API response object. This would be the most direct way to add content to the page from a third party but would require a specific block and styles for that block. By re-running the block logic to the content added from Atama it allows the same logic to be re-used.

Of course another option is just have generic site wide styles, e.g. `.cart { ... }` that would style the card class no matter were inserted, but it seems like AEM would prefer you target individual blocks.


#### TODO: Experiment adding markup and see what happens

An experiment could be adding some markup to the page and see what happens. For example from the basic starter tutorial, add soem "cards" to the DOM and see what happens. Maybe the `cards` block logic would magically run. If not is there some way we can manually iterate over blocks and re-run the block level logic when we find a match? 

#### TODO: Experiment creating a SideKick plugin and see what we can target

There is a fairly well documented API for SideKick, we can try to create a plugin and see if we find any great ways to add hooks. For example, perhaps it's possible when viewing a Google Doc to allow a user to insert a block that would allow them to search for data from Atama. The plugin could create the block in doc, and then we could have a block on the AEM side that would recognize this block and pull the markup / data in from Atama Edge.

### Have a solution for displaying volatile data

AEM and the `adaptTo()` conference videos have a bunch of ways to add commerce data to a page but not volatile data, e.g. pricing, availability, or cart contents. The basic idea here is pretty simple, have a block e.g. `pricing-block` that based on the page URL make a fetch request to another system to get some data and render it.

But there is a lot to go into that to make this work.

1. The request needs to be very very fast, which means ideally the data is cached somewhere close to the edge
2. How does that data get cached? The answer to this is likely going to be system dependent but having a plan (likely something that invoves either pushing, or crawling, or doing whatever possible to pre-cache data at the edge), but having architecture diagrams and plans in place for these scenerios would be great
3. Cache invalidation and cache warming features build on top of popular systems might be useful, whether that's directly with Shopify or Adobe Commerce, or on top of Atama.
4. What about customer session information? _See below_

#### TODO: Experiment with CloudFront cache configurations

Attempt to make a simple endpoint that services html. The HTML is of some product data, maybe just

```
<div class="volatile">
    <span> class="debug-epoch">111283842</span>
    <span class="volatile-price">21.12</span>
    <span class="volatile-availability">In Stock</span>
</div>
```

Implement stale while revalidate headers and get the CDN piece of this working. Epoch is there for debugging.

**Add an item to a customer checklist to see if stale while revalidate is appropriate for them**. This should probably be part of a number of investigation questions we might ask a client when implementing AEM if they have data coming from external sources.


### Have solution for adding customer authentication (e.g. for commerce)

tl;dr; How would we add authetication? We could look at Adobe Commerce APIs for example, or Shopify. If somebody wants to use Shopify with AEM, how do we support a customer being able to log in and see purchase history, cart, etc.

