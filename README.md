# **Getting started**

It requires Node.js v18.17+.

**1. Clone the repository**
```
git clone https://github.com/once-ui-system/magic-portfolio.git
```

**2. Install dependencies**
```
npm install
```

**3. Run dev server**
```
npm run dev
```

**4. Edit config**
```
src/app/resources/config
```

**5. Edit content**
```
src/app/resources/content (or content-i18n for localization)
```

**6. Create blog posts / projects**
```
Add a new .mdx file to src/app/[locale]/blog/posts or src/app/[locale]/work/projects
```

# **Features**

## **SEO**
- Automatic open-graph and X image generation with next/og
- Automatic schema and metadata generation based on the content file

## **Design**
- Responsive layout optimized for all screen sizes
- Timeless design without heavy animations and motion

## **Content**
- Render sections conditionally based on the content file
- Enable or disable pages for blog, work, gallery and about / CV
- Generate and display social links automatically
- Set up password protection for URLs

# **License**

Distributed under the CC BY-NC 4.0 License.
- Commercial usage is not allowed.
- Attribution is required.

See `LICENSE.txt` for more information.