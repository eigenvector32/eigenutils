// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IXYZ } from "../IXYZ";
import { linearInterpolate } from "../../math/linearInterpolate";

// http://www.brucelindbloom.com/index.html?Eqn_XYZ_to_T.html

const reciprocalTemperature: number[] = [
  Number.MIN_VALUE,
  10.0e-6,
  20.0e-6,
  30.0e-6,
  40.0e-6,
  50.0e-6,
  60.0e-6,
  70.0e-6,
  80.0e-6,
  90.0e-6,
  100.0e-6,
  125.0e-6,
  150.0e-6,
  175.0e-6,
  200.0e-6,
  225.0e-6,
  250.0e-6,
  275.0e-6,
  300.0e-6,
  325.0e-6,
  350.0e-6,
  375.0e-6,
  400.0e-6,
  425.0e-6,
  450.0e-6,
  475.0e-6,
  500.0e-6,
  525.0e-6,
  550.0e-6,
  575.0e-6,
  600.0e-6
];

// See https://en.wikipedia.org/wiki/Correlated_color_temperature for info on what U and V refer to
interface UVT {
  u: number;
  v: number;
  t: number;
}

const uvtTable: UVT[] = [
  { u: 0.18006, v: 0.26352, t: -0.24341 },
  { u: 0.18066, v: 0.26589, t: -0.25479 },
  { u: 0.18133, v: 0.26846, t: -0.26876 },
  { u: 0.18208, v: 0.27119, t: -0.28539 },
  { u: 0.18293, v: 0.27407, t: -0.3047 },
  { u: 0.18388, v: 0.27709, t: -0.32675 },
  { u: 0.18494, v: 0.28021, t: -0.35156 },
  { u: 0.18611, v: 0.28342, t: -0.37915 },
  { u: 0.1874, v: 0.28668, t: -0.40955 },
  { u: 0.1888, v: 0.28997, t: -0.44278 },
  { u: 0.19032, v: 0.29326, t: -0.47888 },
  { u: 0.19462, v: 0.30141, t: -0.58204 },
  { u: 0.19962, v: 0.30921, t: -0.70471 },
  { u: 0.20525, v: 0.31647, t: -0.84901 },
  { u: 0.21142, v: 0.32312, t: -1.0182 },
  { u: 0.21807, v: 0.32909, t: -1.2168 },
  { u: 0.22511, v: 0.33439, t: -1.4512 },
  { u: 0.23247, v: 0.33904, t: -1.7298 },
  { u: 0.2401, v: 0.34308, t: -2.0637 },
  { u: 0.24792, v: 0.34655, t: -2.4681 } /* Note: 0.24792 is a corrected value for the error found in W&S as 0.24702 */,
  { u: 0.25591, v: 0.34951, t: -2.9641 },
  { u: 0.264, v: 0.352, t: -3.5814 },
  { u: 0.27218, v: 0.35407, t: -4.3633 },
  { u: 0.28039, v: 0.35577, t: -5.3762 },
  { u: 0.28863, v: 0.35714, t: -6.7262 },
  { u: 0.29685, v: 0.35823, t: -8.5955 },
  { u: 0.30505, v: 0.35907, t: -11.324 },
  { u: 0.3132, v: 0.35968, t: -15.628 },
  { u: 0.32129, v: 0.36011, t: -23.325 },
  { u: 0.32931, v: 0.36038, t: -40.77 },
  { u: 0.33724, v: 0.36051, t: -116.45 }
];

// Values less than this will be considered too close to zero to give meaningful results
const epsilon: number = 1.0e-20;

// Computes the correlated color temperature from an XYZ color using the Robertson 1968 Correlated Colour Temperature algorithm.
// Note that there are several other different valid ways of computing CCT and so just picking a random bit of code that
// says it calculates temperature will often give different results.
export function xyzToTemperature(input: IXYZ): number {
  if (Math.abs(input.x) < epsilon || Math.abs(input.y) < epsilon || Math.abs(input.z) < epsilon) {
    return 0;
  }

  const us: number = (4.0 * input.x) / (input.x + 15.0 * input.y + 3.0 * input.z);
  const vs: number = (6.0 * input.y) / (input.x + 15.0 * input.y + 3.0 * input.z);
  let dm: number = 0;
  let di: number = 0;
  let matchingIndex: number = -1;
  for (let i: number = 0; i < uvtTable.length; i++) {
    di = vs - uvtTable[i].v - uvtTable[i].t * (us - uvtTable[i].u);
    if (i > 0 && ((di < 0.0 && dm >= 0.0) || (di >= 0.0 && dm < 0.0))) {
      matchingIndex = i;
      break; /* found lines bounding (us, vs) : i-1 and i */
    }
    dm = di;
  }
  if (matchingIndex <= 0) {
    // Color doesn't correspond to a valid temperature
    return 0;
  }
  di = di / Math.sqrt(1.0 + uvtTable[matchingIndex].t * uvtTable[matchingIndex].t);
  dm = dm / Math.sqrt(1.0 + uvtTable[matchingIndex - 1].t * uvtTable[matchingIndex - 1].t);
  const p: number = dm / (dm - di);
  console.log(`xyzToTemperature: matchingIndex=${matchingIndex}, us=${us}, vs=${vs}`);
  return 1.0 / linearInterpolate(p, reciprocalTemperature[matchingIndex - 1], reciprocalTemperature[matchingIndex]);
}
