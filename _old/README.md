# NOTES TO MERYEM FROM YASSINE

> Hi Meryem! Check the changes I applied to `components/Products.jsx`

> Kindly apply the same concepts to other pages. Thanks.

## State Management

- All booleans responsible for a specific product's visible popups are stored in the `products` state. (instead of many array states like [`false`, `true`, `false`])
- When the products are fetched using `useEffect` the response is formatted as an array of `{productId, data, isSelecled, isToBeDeleted, isOpen}`
- `productId` is used to identify the product when performing an action like selection or making a popup visible (don't use the index to identify the product)
- `data` is an object containing the product's data.
- `isSelected` is a boolean responsible for product selection.
- `isToBeDeleted` is a boolean that's set after performing deletion to filter the deleted product from the list before getting a response from the API. (optimistic feedback).
- `isOpen` is an object that contains booleans like `isOpenOptions` responsible for a popup's visibility.
- `closeAllOpen()` resets `isOpen`;
- `closeAllToggleOne({event, productId, isOpen})` reduces the `products` and resets `isOpen` except the one specified by `productId` and `isOpen` parameters. In this case, it toggles the boolean (`false` to `true` and vice-versa).
- The `isOpenNewProduct` boolean state is defined outside of `products` and is responsible for the new product popup visibility.
- The `editField` state is definded outside of `products` and is responsible for storing which field is in editing mode and its value. The stored state looks like this: `{productId, field, value}`. (We don't need a `values` array to store edits since we edit only one value at a time)
- You don't need to store 3 count states. `productsCount` state is now an object containing all counts like this: `{active: 1, all: 3, suspended: 2}`
- You don't need to define skip as a state since it's calculated from other states: `skip === (page - 1) * limit`.
- All effects are moved to the bottom to make sure all the states and callbacks are defined first.

## Pagination

- A `hooks` folder was added to `src`. It contains a `products.js` script that includes a function called `getProducts()`.
- `getProducts({state, page, itemPerPage})` is an asynchronous function that fetches products and returns the response `{products, counts}`.
- A function `fetchAndSetProducts()` was added to `../components/Products`.
- `fetchAndSetProducts({state, page, itemPerPage})` logic:
  - sets `products` to `[]`.
  - Sets `currentPage` to `page`;
  - Sets `suspensionStatus` to `status`;
  - Fetches products using `getProducts()`.
  - Checks if `currentPage` is greater than the total pages calculated from the fetched `counts`.
  - If so, it envokes `fetchAndSetProducts()` (itself) again with the total pages as the `page` argument.
  - Sets `products` and `counts` to the fetched values.
- `fetchAndSetProducts()` is envoked in three case:
  - On first render using `useEffect` or when `refresh` changes.
  - When the user changes the page using the `changePage()` with `page` set to the new page and `status` set to `suspensionStatus`.
  - When the user changes suspension status using `changeSuspensionStatus()` with `page` set to `1` and `status` set to the new status.

## Optimistic Feedback

- When performing an action that updates the products, the fetching may take some time to get a response. Optimistic feedback is updating the state (`products`) without waiting for the updated state from the API.

## Components

- I moved product reviews out of `Products`. It's a separate independent section so it should be defined as a separate component (`ProductReviews`).
- `ProductReviews` props shouldn't include callbacks other than ones related to events needed in `Products` like `onClose`.
- The only state it needs is `productId` but other states like `page`, `productReviews`, `counts`, `options` ... are only used inside so they shouldn't be defined outside.
- The same can be applyed to other overlay popups like product orders popup.

# API changes

- Updating a product can be done from one endpoint: `/management/products/edit` and requires `productId` and `changes`.
- `changes` is an object with keys specifying the data to be updated and the values specifying the new value. Example: `changes: {title: "New Product"}`.
- You don't have to include all data. Include only the ones to be updated and the others will be ignored.

## Style

- Components should have a prefixed `className` like `dikafood-type-name` to prevent conflict with other classes. Example: `dikafood-comp-input`, `dikafood-page-products`.
- Please double check the prototype for styling: colors, borders and sizes. Many parts lack fidelity to the original design.

# DikaFood CMS

This is the CMS (Content Management System) for DikaFood.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Start the dummy API server:
```bash
npm run server
```
Or with auto-restart on file changes:
```bash
npm run server:dev
```

## Dummy Authentication

Use the following credentials to log in:

- Email: `admin@example.com`
- Password: `password`

## Available Scripts

- `npm run dev` - Starts the Vite development server
- `npm run build` - Builds the app for production
- `npm run preview` - Locally preview the production build
- `npm run server` - Run the dummy Express API server
- `npm run server:dev` - Run the Express server with Nodemon for auto-restart
