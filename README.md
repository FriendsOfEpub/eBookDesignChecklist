# blitz-checklist

A template repository to make checklist web apps

This tool is part of the [Blitz Framework](http://friendsofepub.github.io/Blitz/) and is the tiny little engine that powers the [BlitzOptim](https://friendsofepub.github.io/eBookDesignChecklist/) and [BlitzPerf](https://friendsofepub.github.io/eBookPerfChecklist/) web apps.

## Abstract

Blitz checklist is a template repository leveraging [Mustache](http://mustache.github.io) to create interactive checklists. It provides all assets required for a Progressive Web App and a JSON model to generate its index page.

## Install

First make sure you have nodeJS and npm installed. If you don’t [install it](https://nodejs.org/).

Then either clone this repository:

```
git clone https://github.com/FriendsOfEpub/blitz-checklist.git
```

Or “use this template” on github, which will create your own repository with the same files and folders, and clone yours.

Finally `cd` into the project and:

```
npm install
```

This will install Mustache as a dev dependency.

## Build

When you need to generate a new `index.html`, run: 

```
npm run build
```

This will use `data.json` to generate your web app.

## Keep in Sync With the Template Repository

You’ll have to add the template repository as a remote:

```
git remote add template https://github.com/FriendsOfEpub/blitz-checklist.git
```

Then fetch when you want to update the changes:

```
git fetch --all
```

Then to merge the changes from the template, checkout to the branch you want to update and try:

```
git merge template/master --allow-unrelated-histories
```

Yet expect to resolve some conflicts for the merge to go through, as the 2 repos have unrelated histories.

## Customize Your Web App

Blitz checklist provides everything required to build a Progressive Web App, but it should be considered **a boilerplate you have to customize.**

### Customize Assets

In `assets` you will find an `icons` folder where you should put the web app’s icons. This will be used on the springboard when installing the app on iOS for instance, or home screen on Android. The recommended sizes are `256 * 256` and `512 * 512` – so that Android can generate a splash screen –, in `PNG` format. Note you can change these in `manifest.json` if needed.

The logo will be used in the header of the web app.

Don’t forget to customize your favicon!

### Customize Styles

In `css` you will find a global stylesheet, and one specific to print – users can indeed print the checklist.

Note the `name` you are using for sections in `data.json` is used extensively if you want to add section-specific styles:

- the section’s `id` has a `-list` suffix e.g. if the `name` has the value of `css` then the `id` is `css-list`;
- its heading’s `id` (`h2`) has a `-heading` suffix e.g. `css-heading`.

In addition, the `name` attribute of the section’s `inputs` use this value.

### Customize JS

In `js` you will find a script.

You must at least customize `STORAGE_PREFIX` at the top of the file.

You may also want to customize `HELP_TEXT` if the default one doesn’t suit you.

### Customize the Manifest

In `manifest.json` you must at least customize:

- `name`
- `short_name`
- `start_url`
- `background_color`
- `theme_color`

[See MDN for further details](https://developer.mozilla.org/en-US/docs/Web/Manifest).

### Customize the Service Worker

In `sw.js` you must at least customize:

- `APP_PREFIX`: the prefix that will be used to cache contents;
- `SCOPE`: the scope of your Service Worker (the path it controls);
- `VERSION`: the current version of the app (to update every time you push a new version).

These variables are used for the name of the cache, and the URLs the Service Worker will cache/handle. Please be very cautious as this is very easy to mess up on an update.

If you’re not familiar with Service Workers, [check this introduction](https://developers.google.com/web/fundamentals/primers/service-workers).

### Values Must Match

Some values in `manifest.json`, `data.json`, `sw.js` and `script.js` should match if you want the web app to be consistent or function properly (scope).

| manifest.json    | data.json      | sw.js      | script.js      |
|------------------|----------------|------------|----------------|
| short_name       | appName        | N/A        | N/A            |
| start_url        | appScope       | SCOPE      | N/A            |
| background_color | accentColor    | N/A        | N/A            |
| theme_color      | accentColor    | N/A        | N/A            |
| N/A              | appVersion     | VERSION    | N/A            |
| N/A              | N/A            | APP_PREFIX | STORAGE_PREFIX |

## Create a Checklist

To create an `index.html` file, you must first populate `src/data.json` with contents. Indeed this is what `src/template.mustache` will use to generate the checklist app.

### appName

The `appName` property expects a string. This will be used in the `title` of the document and SHOULD match the manifest’s `short_name`.

### appVersion

The `appVersion` SHOULD match the value of the `VERSION` variable in `sw.js`. It will be displayed in the footer of the app. Ideally, `package.json`’s `version` should match as well. 

### appDesc

The `appDesc` property expects a string. This will be used in the `<meta name="description">` of the document to improve SEO.

### appLogo

The `appLogo` property expects the path to your logo.

If the value is set to `null` or an empty string (`""`), no logo (`img`) will be rendered.

### appScope

The `appScope` property expects the path Service Workers should handle. **It MUST match the manifest’s `start_url` and Service Worker’s `SCOPE`.**

### lang

The `lang` property expects a [BCP-47 language tag](https://tools.ietf.org/html/bcp47) e.g. `en`, `en-US`, etc. It will be used to set the language of the document.

### accentColor

The `accentColor` property expects an HEX value e.g. `#000000`. It will be used to customize the web app’s theming, and SHOULD match the manifest’s `background_color` and `theme_color`.

### header

The `header` property expects an object:

```
{
  "title": "h1 of the page"
  "lead": [
    "Desc of your web app"
  ]
}
```

The `title` will be used for the `h1` of the webpage.

The `lead` property expects an array of strings. It serves as a description of the web app. For each item in the array, a new paragraph will be created. It accepts either raw text or HTML. If empty, only the title will be rendered.

Note the values of `title` and `lead` can be raw text or HTML.

### sections

The `sections` property expects an array of Section Objects. For each object, you will use Rule Objects to define items in the checklist’s section.

#### Section Object

A Section Object is made of 4 properties:

```
{
  "name": "string",
  "skippable": boolean,
  "heading": "string",
  "rules": [Rule Object]
}
```

The `name` is the name of the section, that will be used for the labels’ input (`name` property), the section’s and heading’s `id`. **It MUST consequently be unique and abide by [`id`’s limitations and compatibility issues](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id).**

The `skippable` property expects a boolean i.e. `true` or `false`. When set to `true`, a button to skip the section will be created – when clicking this button, all boxes are checked, and the user is sent to the next section. This may come in handy if your checklist has a set of rules that don’t apply to every project you manage.

The `heading` property expects a string. It will be used for the `h2` of the section. The value can be raw text or HTML.

The `rules` property expects an array of Rule Objects. This basically lists all the labels for the current section.

#### Rule Object

A Rule Object is made of 3 properties:

```
{
  "value": "string",
  "summary": "string",
  "details": ["string", "another-string"]
}
```

The `value` property expects a string. It will be used for the `value` of the `input`. **It MUST be unique.**

The `summary` property expects a string. It will be used as the `label` of the input. When clicking this label, details will be displayed/hidden. The value can be raw text or HTML.

The `details` property expects an array of strings. For each value in the array, a new paragraph will be created in the details. It accepts either raw text or HTML. If empty, “No details available :(” will be used as the default – as a means to encourage proper documentation.

### footer

The `footer` property expects an array of strings. For each value in the array, a new paragraph will be created in the footer. It accepts either raw text or HTML. If empty, only the version will be rendered.

## Notes

- Using Mustache is completely optional, you can use the existing markup in `index.html` if you are more comfortable with HTML – you should be fine as long as you follow the templating rules.
- Mustache (and `data.json`) are not used at runtime, they are meant to generate a static HTML file locally/server-side.
- The Web App is designed to run without JavaScript, albeit minimally (no interaction, no automatic save, etc.).
- Everything is handled client-side (in the browser), no data is sent to any server and is therefore completely private – it’s not even shareable with co-workers.

## FAQ

### Why JSON, why!?

It’s not about JSON but Mustache, a templating system that makes it way easier to create, maintain and update checklists. For the past 3 years, maintenance and updates have been a huge downside of BlitzOptim and BlitzDesign, as the update process was highly error-prone.

With Mustache, data is now separated from markup. And it’s a lot easier to modify/generate the markup in one place instead of fifty.

Finally it’s available on a large amount of different platforms, so should make it easier to use the data in a non-web context.

### Can I keep using v1 of BlitzOptim and BlitzDesign?

Yes, absolutely. 

If you don’t want to migrate to Mustache and are more comfortable with the idea of manually maintaining the checklist, then you can use the `v.1.0.4` tag in your fork. 

Note you’ll have to backport fixes and improvements though, as there won’t be any further development for this version.