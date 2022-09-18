[![CI](https://github.com/kaiosilveira/combine-functions-into-class-refactoring/actions/workflows/ci.yml/badge.svg)](https://github.com/kaiosilveira/combine-functions-into-class-refactoring/actions/workflows/ci.yml)

ℹ️ _This repository is part of my Refactoring catalog based on Fowler's book with the same title. Please see [kaiosilveira/refactoring](https://github.com/kaiosilveira/refactoring) for more details._

---

# Combine Functions into Class

<table>
<thead>
<th>Before</th>
<th>After</th>
</thead>
<tbody>
<tr>
<td>

```javascript
function base(aReading) {
  /* ... */
}

function taxableCharge(aReading) {
  /* ... */
}

function calculateBaseCharge(aReading) {
  /* ... */
}
```

</td>

<td>

```javascript
class Reading {
  base() {
    /* ... */
  }

  taxableCharge() {
    /* ... */
  }

  calculateBaseCharge() {
    /* ... */
  }
}
```

</td>
</tr>
</tbody>
</table>

Sometimes we see groups of functions operating together over a chunk of data. These functions may be independent and well-defined, but their responsibilities are tightly related to some other, bigger aspect of a piece of computation. In these cases, there is sometimes a hidden class waiting to be discovered. This refactoring helps with putting these functions together to form this class.

## Working example

The working example for this refactoring is a small system that calculates the taxable charge for... tea (?). It contains helper functions to calculate the `baseRate` and the `taxThreshold`, but there is a lot of duplication when it comes to calculating the base charge inside the clients of this code. Our goal is to combine these different aspects into a new class called `Reading` and use it in all clients, even adding some additional behavior to it if possible.

The `tax-utils/index.js` file holds the utility functions for calculating the `baseCharge` and the `taxThreshold`:

```javascript
function baseRate(month, year) {
  return RATES_BY_MONTH_AND_YEAR[`${month}/${year}`];
}

function taxThreshold(year) {
  return THRESHOLDS_BY_YEAR[year];
}
```

Clients one and two have the logic for calculating the base charge duplicated:

```javascript
// client 1:
const aReading = acquireReading();
const baseCharge = baseRate(aReading.month, aReading.year) * aReading.quantity;

// client 2:
const aReading = acquireReading();
const base = baseRate(aReading.month, aReading.year) * aReading.quantity;
```

While client three has a method already created to do this job:

```javascript
// client 3
const aReading = acquireReading();
const basicChargeAmount = calculateBaseCharge(aReading);

console.log(`basic charge amount is ${basicChargeAmount}`);

function calculateBaseCharge(aReading) {
  return baseRate(aReading.month, aReading.year) * aReading.quantity;
}
```

After all the refactoring steps described in the following sections, we will end up with a `Reading` class with specific methods for calculating the `baseCharge` and the `taxableCharge` for a given reading.

### Test suite

Writing a test suite for this example was hard, mainly because this domain doesn't quite make sense but also because the `baseRate` and `taxThreshold` functions were not well explored in the book (of course because they were not the focus). So a dummy logic was put in place, using lookup objects with fixed values.

While the refactoring evolved, though, important tests were needed, mainly to preserve the behavior of the `Reading` class, but also to cover the new functionalities added to it. The final test suite for the `Reading` class looks like this:

```javascript
describe('Reading', () => {
  it('should provide getters for quantity, customer, month and year', () => {
    const rawData = { customer: 'Ivan', quantity: 10, month: 5, year: 2017 };
    const reading = new Reading(rawData);

    expect(reading.customer).toEqual(rawData.customer);
    expect(reading.quantity).toEqual(rawData.quantity);
    expect(reading.month).toEqual(rawData.month);
    expect(reading.year).toEqual(rawData.year);
  });

  describe('calculateBaseCharge', () => {
    it('should calculate the base charge for a given reading', () => {
      const mockedBaseRate = 1;
      const rawData = { customer: 'Ivan', quantity: 10, month: 5, year: 2017 };

      jest.spyOn(TaxUtils, 'baseRate').mockReturnValue(mockedBaseRate);
      const reading = new Reading(rawData);

      expect(reading.baseCharge).toEqual(mockedBaseRate * reading.quantity);
    });
  });

  describe('taxableCharge', () => {
    it('should calculate the correct taxable charge', () => {
      jest.spyOn(TaxUtils, 'taxThreshold').mockReturnValue(1);
      jest.spyOn(TaxUtils, 'baseRate').mockReturnValue(1);

      const rawData = { customer: 'Ivan', quantity: 10, month: 5, year: 2017 };
      const reading = new Reading(rawData);

      expect(reading.taxableCharge).toEqual(9);
    });
  });
});
```

### Steps

To start with this refactoring, we need to first introduce a class to wrap the raw `reading` object being used by the clients via the `acquireReading` method:

```diff
diff --git a/src/reading/index.js b/src/reading/index.js
@@ -0,0 +1,26 @@
+class Reading {
+  constructor(data) {
+    this._customer = data.customer;
+    this._quantity = data.quantity;
+    this._month = data.month;
+    this._year = data.year;
+  }
+
+  get customer() {
+    return this._customer;
+  }
+
+  get quantity() {
+    return this._quantity;
+  }
+
+  get month() {
+    return this._month;
+  }
+
+  get year() {
+    return this._year;
+  }
+}
+
+module.exports = { Reading };

diff --git a/src/reading/index.test.js b/src/reading/index.test.js
@@ -0,0 +1,13 @@
+const { Reading } = require('.');
+
+describe('Reading', () => {
+  it('should provide getters for quantity, customer, month and year', () => {
+    const rawData = { customer: 'Ivan', quantity: 10, month: 5, year: 2017 };
+    const reading = new Reading(rawData);
+
+    expect(reading.customer).toEqual(rawData.customer);
+    expect(reading.quantity).toEqual(rawData.quantity);
+    expect(reading.month).toEqual(rawData.month);
+    expect(reading.year).toEqual(rawData.year);
+  });
+});
```

We then move forward to start using this `Reading` class at `client3.js`:

```diff
diff --git a/src/client3.js b/src/client3.js
@@ -1,7 +1,9 @@
+const { Reading } = require('./reading');
 const { acquireReading } = require('./acquire-reading');
 const { baseRate } = require('./tax-utils');

-const aReading = acquireReading();
+const rawReading = acquireReading();
+const aReading = new Reading(rawReading);
 const basicChargeAmount = calculateBaseCharge(aReading);

 console.log(`basic charge amount is ${basicChargeAmount}`);
```

Up to this point, nothing has changed and everything should still work fine, as the getters in the class will behave the same way as the properties in the raw object do.

Now, we can introduce a `calculateBaseCharge` method at the `Reading` class, as a replication of the method that's already part of `client3.js`:

```diff
diff --git a/src/reading/index.js b/src/reading/index.js
@@ -1,3 +1,5 @@
+const { baseRate } = require('../tax-utils');
+
 class Reading {
   constructor(data) {
     this._customer = data.customer;
@@ -21,6 +23,10 @@ class Reading {
   get year() {
     return this._year;
   }
+
+  calculateBaseCharge() {
+    return baseRate(this.month, this.year) * this.quantity;
+  }
 }

 module.exports = { Reading };

diff --git a/src/reading/index.test.js b/src/reading/index.test.js
@@ -1,4 +1,7 @@
+jest.mock('../tax-utils');
+
 const { Reading } = require('.');
+const TaxUtils = require('../tax-utils');

 describe('Reading', () => {
   it('should provide getters for quantity, customer, month and year', () => {
@@ -10,4 +13,16 @@ describe('Reading', () => {
     expect(reading.month).toEqual(rawData.month);
     expect(reading.year).toEqual(rawData.year);
   });
+
+  describe('calculateBaseCharge', () => {
+    it('should calculate the base charge for a given reading', () => {
+      const mockedBaseRate = 1;
+      const rawData = { customer: 'Ivan', quantity: 10, month: 5, year: 2017 };
+
+      jest.spyOn(TaxUtils, 'baseRate').mockReturnValue(mockedBaseRate);
+      const reading = new Reading(rawData);
+
+      expect(reading.calculateBaseCharge()).toEqual(mockedBaseRate * reading.quantity);
+    });
+  });
 });
```

And then, of course, we can change `client3.js` to use the `calculateBaseCharge` method from the `Reading` class instance and remove the `calculateBaseCharge` function from the client itself:

```diff
diff --git a/src/client3.js b/src/client3.js
@@ -1,13 +1,8 @@
 const { Reading } = require('./reading');
 const { acquireReading } = require('./acquire-reading');
-const { baseRate } = require('./tax-utils');

 const rawReading = acquireReading();
 const aReading = new Reading(rawReading);
-const basicChargeAmount = calculateBaseCharge(aReading);
+const basicChargeAmount = aReading.calculateBaseCharge();

 console.log(`basic charge amount is ${basicChargeAmount}`);
-
-function calculateBaseCharge(aReading) {
-  return baseRate(aReading.month, aReading.year) * aReading.quantity;
-}
```

At this point we can pause for a small improvement, renaming the `calculateBaseCharge` method to `baseCharge` and making it a getter instead:

```diff
diff --git a/src/client3.js b/src/client3.js
@@ -3,6 +3,6 @@ const { acquireReading } = require('./acquire-reading');

 const rawReading = acquireReading();
 const aReading = new Reading(rawReading);
-const basicChargeAmount = aReading.calculateBaseCharge();
+const basicChargeAmount = aReading.baseCharge;

 console.log(`basic charge amount is ${basicChargeAmount}`);

diff --git a/src/reading/index.js b/src/reading/index.js
@@ -24,7 +24,7 @@ class Reading {
     return this._year;
   }

-  calculateBaseCharge() {
+  get baseCharge() {
     return baseRate(this.month, this.year) * this.quantity;
   }
 }

diff --git a/src/reading/index.test.js b/src/reading/index.test.js
@@ -22,7 +22,7 @@ describe('Reading', () => {
       jest.spyOn(TaxUtils, 'baseRate').mockReturnValue(mockedBaseRate);
       const reading = new Reading(rawData);

-      expect(reading.calculateBaseCharge()).toEqual(mockedBaseRate * reading.quantity);
+      expect(reading.baseCharge).toEqual(mockedBaseRate * reading.quantity);
     });
   });
 });
```

Moving forward, we now can update `client1.js` and `client2.js` to use the `baseCharge` calculation from the `Reading` class instance:

```diff
diff --git a/src/client1.js b/src/client1.js
@@ -1,7 +1,8 @@
 const { acquireReading } = require('./acquire-reading');
-const { baseRate } = require('./tax-utils');
+const { Reading } = require('./reading');

-const aReading = acquireReading();
-const baseCharge = baseRate(aReading.month, aReading.year) * aReading.quantity;
+const rawReading = acquireReading();
+const aReading = new Reading(rawReading);
+const baseCharge = aReading.baseCharge;

 console.log(`base charge is ${baseCharge}`);

diff --git a/src/client2.js b/src/client2.js
@@ -1,8 +1,10 @@
 const { acquireReading } = require('./acquire-reading');
-const { baseRate, taxThreshold } = require('./tax-utils');
+const { Reading } = require('./reading');
+const { taxThreshold } = require('./tax-utils');

-const aReading = acquireReading();
-const base = baseRate(aReading.month, aReading.year) * aReading.quantity;
+const rawReading = acquireReading();
+const aReading = new Reading(rawReading);
+const base = aReading.baseCharge;
 const taxableCharge = Math.max(0, base - taxThreshold(aReading.year));

 console.log(`base charge is ${base}`);
```

And even remove the `base` variable defined at `client2.js`:

```diff
diff --git a/src/client2.js b/src/client2.js
@@ -4,8 +4,7 @@ const { taxThreshold } = require('./tax-utils');

 const rawReading = acquireReading();
 const aReading = new Reading(rawReading);
-const base = aReading.baseCharge;
-const taxableCharge = Math.max(0, base - taxThreshold(aReading.year));
+const taxableCharge = Math.max(0, aReading.baseCharge - taxThreshold(aReading.year));

-console.log(`base charge is ${base}`);
+console.log(`base charge is ${aReading.baseCharge}`);
 console.log(`taxable charge is ${taxableCharge}`);
```

`client2.js` has an additional piece of logic that calculates the `taxableCharge` for a given reading. This seems to be a responsibility of the `Reading` class as well, so we can start moving this piece of computation to the class. We start by extracting a function on the computation logic and introducing a `taxableChargeFn` function at `tax-utils`:

```diff
diff --git a/src/tax-utils/index.js b/src/tax-utils/index.js
@@ -25,4 +25,14 @@ function taxThreshold(year) {
   return THRESHOLDS_BY_YEAR[year];
 }

-module.exports = { baseRate, taxThreshold, RATES_BY_MONTH_AND_YEAR, THRESHOLDS_BY_YEAR };
+function taxableChargeFn(aReading) {
+  return Math.max(0, aReading.baseCharge - taxThreshold(aReading.year));
+}
+
+module.exports = {
+  baseRate,
+  taxThreshold,
+  taxableChargeFn,
+  RATES_BY_MONTH_AND_YEAR,
+  THRESHOLDS_BY_YEAR,
+};

diff --git a/src/tax-utils/index.test.js b/src/tax-utils/index.test.js
@@ -1,4 +1,10 @@
-const { baseRate, RATES_BY_MONTH_AND_YEAR, taxThreshold, THRESHOLDS_BY_YEAR } = require('.');
+const {
+  baseRate,
+  RATES_BY_MONTH_AND_YEAR,
+  taxThreshold,
+  THRESHOLDS_BY_YEAR,
+  taxableChargeFn,
+} = require('.');

 describe('tax-utils', () => {
   describe('baseRate', () => {
@@ -12,4 +18,14 @@ describe('tax-utils', () => {
       expect(taxThreshold(2017)).toEqual(THRESHOLDS_BY_YEAR[2017]);
     });
   });
+
+  describe('taxableChargeFn', () => {
+    it('should return zero if result is negative', () => {
+      expect(taxableChargeFn({ baseCharge: 0, year: 2017 })).toEqual(0);
+    });
+
+    it('should calculate the correct taxable charge', () => {
+      expect(taxableChargeFn({ baseCharge: 1, year: 2017 })).toEqual(0.5);
+    });
+  });
 });
```

Then, we can update `client2.js` to start using the `taxableChargeFn`:

```diff
diff --git a/src/client2.js b/src/client2.js
@@ -1,10 +1,10 @@
 const { acquireReading } = require('./acquire-reading');
 const { Reading } = require('./reading');
-const { taxThreshold } = require('./tax-utils');
+const { taxableChargeFn } = require('./tax-utils');

 const rawReading = acquireReading();
 const aReading = new Reading(rawReading);
-const taxableCharge = Math.max(0, aReading.baseCharge - taxThreshold(aReading.year));
+const taxableCharge = taxableChargeFn(aReading);

 console.log(`base charge is ${aReading.baseCharge}`);
 console.log(`taxable charge is ${taxableCharge}`);
```

Now, starting to migrate the behavior inside the `Reading` class, we can add a getter for the `taxableCharge` calculation, which uses the `taxableChargeFn` method:

```diff
diff --git a/src/reading/index.js b/src/reading/index.js
@@ -1,4 +1,4 @@
-const { baseRate } = require('../tax-utils');
+const { baseRate, taxableChargeFn } = require('../tax-utils');

 class Reading {
   constructor(data) {
@@ -27,6 +27,10 @@ class Reading {
   get baseCharge() {
     return baseRate(this.month, this.year) * this.quantity;
   }
+
+  get taxableCharge() {
+    return taxableChargeFn(this);
+  }
 }

 module.exports = { Reading };

diff --git a/src/reading/index.test.js b/src/reading/index.test.js
@@ -25,4 +25,15 @@ describe('Reading', () => {
       expect(reading.baseCharge).toEqual(mockedBaseRate * reading.quantity);
     });
   });
+
+  describe('taxableCharge', () => {
+    it('should calculate the correct taxable charge', () => {
+      jest.spyOn(TaxUtils, 'taxableChargeFn').mockReturnValue(0.5);
+
+      const rawData = { customer: 'Ivan', quantity: 10, month: 5, year: 2017 };
+      const reading = new Reading(rawData);
+
+      expect(reading.taxableCharge).toEqual(0.5);
+    });
+  });
 });
```

Now, `client2.js` can call `taxableCharge` from the `Reading` getter instead of using the `taxableChargeFn` directly:

```diff
diff --git a/src/client2.js b/src/client2.js
@@ -1,10 +1,9 @@
 const { acquireReading } = require('./acquire-reading');
 const { Reading } = require('./reading');
-const { taxableChargeFn } = require('./tax-utils');

 const rawReading = acquireReading();
 const aReading = new Reading(rawReading);
-const taxableCharge = taxableChargeFn(aReading);
+const taxableCharge = aReading.taxableCharge;

 console.log(`base charge is ${aReading.baseCharge}`);
 console.log(`taxable charge is ${taxableCharge}`);
```

All of this only to inline the `taxableChargeFn` function in the `taxableCharge` getter:

```diff
diff --git a/src/reading/index.js b/src/reading/index.js
@@ -1,4 +1,4 @@
-const { baseRate, taxableChargeFn } = require('../tax-utils');
+const { baseRate, taxThreshold } = require('../tax-utils');

 class Reading {
   constructor(data) {
@@ -29,7 +29,7 @@ class Reading {
   }

   get taxableCharge() {
-    return taxableChargeFn(this);
+    return Math.max(0, this.baseCharge - taxThreshold(this.year));
   }
 }

diff --git a/src/reading/index.test.js b/src/reading/index.test.js
@@ -28,12 +28,13 @@ describe('Reading', () => {

   describe('taxableCharge', () => {
     it('should calculate the correct taxable charge', () => {
-      jest.spyOn(TaxUtils, 'taxableChargeFn').mockReturnValue(0.5);
+      jest.spyOn(TaxUtils, 'taxThreshold').mockReturnValue(1);
+      jest.spyOn(TaxUtils, 'baseRate').mockReturnValue(1);

       const rawData = { customer: 'Ivan', quantity: 10, month: 5, year: 2017 };
       const reading = new Reading(rawData);

-      expect(reading.taxableCharge).toEqual(0.5);
+      expect(reading.taxableCharge).toEqual(9);
     });
   });
 });
```

And to remove the now unused `taxableChargeFn`:

```diff
diff --git a/src/tax-utils/index.js b/src/tax-utils/index.js
@@ -25,14 +25,9 @@ function taxThreshold(year) {
   return THRESHOLDS_BY_YEAR[year];
 }

-function taxableChargeFn(aReading) {
-  return Math.max(0, aReading.baseCharge - taxThreshold(aReading.year));
-}
-
 module.exports = {
   baseRate,
   taxThreshold,
-  taxableChargeFn,
   RATES_BY_MONTH_AND_YEAR,
   THRESHOLDS_BY_YEAR,
 };

diff --git a/src/tax-utils/index.test.js b/src/tax-utils/index.test.js
@@ -18,14 +18,4 @@ describe('tax-utils', () => {
       expect(taxThreshold(2017)).toEqual(THRESHOLDS_BY_YEAR[2017]);
     });
   });
-
-  describe('taxableChargeFn', () => {
-    it('should return zero if result is negative', () => {
-      expect(taxableChargeFn({ baseCharge: 0, year: 2017 })).toEqual(0);
-    });
-
-    it('should calculate the correct taxable charge', () => {
-      expect(taxableChargeFn({ baseCharge: 1, year: 2017 })).toEqual(0.5);
-    });
-  });
 });
```

And that's it! All the behavior related to a reading is now captured inside the `Reading` class and all clients are updated to create instances of this class and make use of it.

### Commit history

| Commit SHA                                                                                                                          | Message                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [47f6abb](https://github.com/kaiosilveira/combine-functions-into-class-refactoring/commit/47f6abb93dfcaeb7fe8a7c6c7eb1cce7df19b6da) | introduce `Reading` class                                                                   |
| [e13efd5](https://github.com/kaiosilveira/combine-functions-into-class-refactoring/commit/e13efd5002f211138b58217913a5c04fffb3d196) | start using `Reading` class at `client3`                                                    |
| [c905e6b](https://github.com/kaiosilveira/combine-functions-into-class-refactoring/commit/c905e6bebae2e06a5f5a0468977a64307e88d5d0) | introduce `calculateBaseCharge` at the `Reading` class                                      |
| [cb609dd](https://github.com/kaiosilveira/combine-functions-into-class-refactoring/commit/cb609dde9e1064ad0b1dcb04cab79a7fde71916a) | change `client3` to use `calculateBaseCharge` from the `Reading` class instance             |
| [cb86b2f](https://github.com/kaiosilveira/combine-functions-into-class-refactoring/commit/cb86b2f1aa5a7a55f6d9e10c278be5a0aadeb166) | rename `calculateBaseCharge` to `baseCharge` and make it a getter                           |
| [416949c](https://github.com/kaiosilveira/combine-functions-into-class-refactoring/commit/416949ce6cd7011fb1cffd3699fd50a8d42d428f) | update clients 1 and 2 to use the base charge calculation from the `Reading` class instance |
| [847cb3d](https://github.com/kaiosilveira/combine-functions-into-class-refactoring/commit/847cb3d2567e3335b411c9fc3107957c90ced740) | remove `base` variable from `client2`                                                       |
| [b3e920a](https://github.com/kaiosilveira/combine-functions-into-class-refactoring/commit/b3e920ab1f76d4b34f34c8ddb472ae719325b2b1) | introduce `taxableChargeFn` function                                                        |
| [5faf318](https://github.com/kaiosilveira/combine-functions-into-class-refactoring/commit/5faf3182f0181e9afe4a617cfdf44d072ef376e1) | update `client2` to start using `taxableChargeFn`                                           |
| [af08129](https://github.com/kaiosilveira/combine-functions-into-class-refactoring/commit/af08129ed016222747dae5b606e13c4303e5c835) | add getter for `taxableCharge` in the `Reading` class                                       |
| [889e45f](https://github.com/kaiosilveira/combine-functions-into-class-refactoring/commit/889e45f9351854cb56f0fc779d7830c2ad7282db) | update `client2` to use `taxableCharge` getter instead of `taxableChargeFn`                 |
| [ad6752b](https://github.com/kaiosilveira/combine-functions-into-class-refactoring/commit/ad6752b1970a8144863fd4b368b78ab722529b2f) | inline `taxableChargeFn` at `taxableCharge` getter                                          |
| [315327d](https://github.com/kaiosilveira/combine-functions-into-class-refactoring/commit/315327d79401ac2a061f84a07e658e88139c6440) | remove unused `taxableChargeFn`                                                             |

The full commit history can be seen in the [Commit History tab](https://github.com/kaiosilveira/combine-functions-into-class-refactoring/commits/main).
