import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, G, Line } from 'react-native-svg';

const YELLOW = '#FFC400';
const BLACK = '#111827';

interface IconProps {
  size?: number;
}

/**
 * 1. General Service Icon - Two-tone Wrench
 */
export const GeneralServiceIcon: React.FC<IconProps> = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    {/* Wrench head & handle */}
    <Path
      d="M26.2 4.8c-3.1-1.3-6.7-.4-8.8 2.2l-2.4 3-9 9c-1.3 1.3-1.3 3.5 0 4.8l2.2 2.2c1.3 1.3 3.5 1.3 4.8 0l9-9 3-2.4c2.6-2.1 3.5-5.7 2.2-8.8l-3.2 3.2-3.8-1 1-3.8 5-3.2z"
      fill={YELLOW}
    />
    <Path
      d="M7.5 22.5l-3.3 3.3c-1.1 1.1-1.1 2.9 0 4l2 2c1.1 1.1 2.9 1.1 4 0l3.3-3.3-6-6z"
      fill={BLACK}
    />
    <Circle cx="8.5" cy="27.5" r="1.5" fill="#FFFFFF" />
  </Svg>
);

/**
 * 2. Battery Service Icon - Car Battery with + and -
 */
export const BatteryServiceIcon: React.FC<IconProps> = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    {/* Terminal posts */}
    <Rect x="8" y="7" width="5" height="3" rx="1" fill={YELLOW} />
    <Rect x="23" y="7" width="5" height="3" rx="1" fill={YELLOW} />
    {/* Battery body */}
    <Rect x="5" y="10" width="26" height="18" rx="3" fill={BLACK} />
    {/* Negative symbol */}
    <Line x1="9" y1="17" x2="13" y2="17" stroke={YELLOW} strokeWidth="2.5" strokeLinecap="round" />
    {/* Positive symbol */}
    <Line x1="23" y1="17" x2="27" y2="17" stroke={YELLOW} strokeWidth="2.5" strokeLinecap="round" />
    <Line x1="25" y1="15" x2="25" y2="19" stroke={YELLOW} strokeWidth="2.5" strokeLinecap="round" />
    {/* Bottom charge bar */}
    <Rect x="9" y="22" width="18" height="2.5" rx="1" fill={YELLOW} />
  </Svg>
);

/**
 * 3. Tyre Service Icon - Wheel Rim & Tire
 */
export const TyreServiceIcon: React.FC<IconProps> = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    {/* Outer tyre */}
    <Circle cx="18" cy="18" r="14" stroke={BLACK} strokeWidth="4.5" />
    {/* Tyre tread dashes */}
    <Circle cx="18" cy="18" r="14" stroke={YELLOW} strokeWidth="1.5" strokeDasharray="3 3" />
    {/* Inner alloy rim */}
    <Circle cx="18" cy="18" r="9" fill={YELLOW} />
    {/* Rim hub */}
    <Circle cx="18" cy="18" r="4.5" fill={BLACK} />
    <Circle cx="18" cy="18" r="2" fill={YELLOW} />
  </Svg>
);

/**
 * 4. Oil Change Icon - Oil Can Dripping
 */
export const OilChangeIcon: React.FC<IconProps> = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    {/* Oil can spout & body */}
    <Path
      d="M7 16l4-6h9l2 4h4c1.1 0 2 .9 2 2v2c0 .6-.4 1-1 1h-1l-3 7H9c-1.1 0-2-.9-2-2V16z"
      fill={BLACK}
    />
    <Path
      d="M10 10l-4-3c-.6-.4-1.4-.2-1.8.4-.4.6-.2 1.4.4 1.8l3.4 2.8H10z"
      fill={YELLOW}
    />
    {/* Can handle */}
    <Path
      d="M21 14h4c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-4"
      stroke={YELLOW}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Droplet */}
    <Path
      d="M27 24c0 2-1.5 3.5-3.5 3.5S20 26 20 24c0-1.8 3.5-5.5 3.5-5.5s3.5 3.7 3.5 5.5z"
      fill={YELLOW}
    />
  </Svg>
);

/**
 * 5. Breakdown Support Icon - Tow Truck / Crane
 */
export const BreakdownSupportIcon: React.FC<IconProps> = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    {/* Truck cabin */}
    <Path
      d="M19 13h5.5l3.5 4.5v5.5H19V13z"
      fill={YELLOW}
    />
    {/* Truck chassis */}
    <Rect x="5" y="18" width="23" height="6" rx="1.5" fill={BLACK} />
    {/* Crane arm */}
    <Path
      d="M8 20L15 9l5 4"
      stroke={YELLOW}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Hook */}
    <Path
      d="M8 20v4c0 1 .8 1.8 1.8 1.8"
      stroke={BLACK}
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Wheels */}
    <Circle cx="10" cy="25" r="3.5" fill={BLACK} />
    <Circle cx="10" cy="25" r="1.5" fill={YELLOW} />
    <Circle cx="24" cy="25" r="3.5" fill={BLACK} />
    <Circle cx="24" cy="25" r="1.5" fill={YELLOW} />
  </Svg>
);

/**
 * 6. AC Service Icon - Snowflake
 */
export const ACServiceIcon: React.FC<IconProps> = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    {/* Vertical line */}
    <Line x1="18" y1="6" x2="18" y2="30" stroke={BLACK} strokeWidth="2.5" strokeLinecap="round" />
    {/* Horizontal line */}
    <Line x1="6" y1="18" x2="30" y2="18" stroke={BLACK} strokeWidth="2.5" strokeLinecap="round" />
    {/* Diagonal 1 */}
    <Line x1="9.5" y1="9.5" x2="26.5" y2="26.5" stroke={BLACK} strokeWidth="2.5" strokeLinecap="round" />
    {/* Diagonal 2 */}
    <Line x1="26.5" y1="9.5" x2="9.5" y2="26.5" stroke={BLACK} strokeWidth="2.5" strokeLinecap="round" />
    {/* Yellow crystal tips */}
    <Path d="M15 8l3-3 3 3" stroke={YELLOW} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 28l3 3 3-3" stroke={YELLOW} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 15l-3 3 3 3" stroke={YELLOW} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M28 15l3 3-3 3" stroke={YELLOW} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Center core */}
    <Circle cx="18" cy="18" r="3.5" fill={YELLOW} />
  </Svg>
);

/**
 * 7. Car Care (Wash & Clean) Icon - Sparkle Car
 */
export const CarCareIcon: React.FC<IconProps> = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    {/* Car body */}
    <Path
      d="M8 17l2.5-4.5c.4-.7 1.1-1.1 1.9-1.1h11.2c.8 0 1.5.4 1.9 1.1L28 17c1.1.3 2 1.3 2 2.5v5c0 .8-.7 1.5-1.5 1.5h-1c-.8 0-1.5-.7-1.5-1.5v-1H10v1c0 .8-.7 1.5-1.5 1.5h-1C6.7 26 6 25.3 6 24.5v-5c0-1.2.9-2.2 2-2.5z"
      fill={YELLOW}
    />
    {/* Windshield */}
    <Path
      d="M10.8 16h14.4l-1.8-3.2c-.2-.4-.6-.6-1-.6H13.6c-.4 0-.8.2-1 .6L10.8 16z"
      fill={BLACK}
    />
    {/* Headlights */}
    <Circle cx="9.5" cy="19.5" r="1.5" fill={BLACK} />
    <Circle cx="26.5" cy="19.5" r="1.5" fill={BLACK} />
    {/* Sparkle 1 */}
    <Path
      d="M27 7l1 2.5L30.5 10.5 28 11.5 27 14l-1-2.5-2.5-1 2.5-1L27 7z"
      fill={YELLOW}
    />
    {/* Sparkle 2 */}
    <Path
      d="M7 9l.6 1.5L9 11.1l-1.4.6L7 13.2l-.6-1.5L5 11.1l1.4-.6L7 9z"
      fill={BLACK}
    />
  </Svg>
);

/**
 * 8. More Services Icon - 4 Rounded Grid Squares
 */
export const MoreServicesIcon: React.FC<IconProps> = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <Rect x="7" y="7" width="9" height="9" rx="3" stroke={BLACK} strokeWidth="2.5" />
    <Rect x="20" y="7" width="9" height="9" rx="3" stroke={BLACK} strokeWidth="2.5" />
    <Rect x="7" y="20" width="9" height="9" rx="3" stroke={BLACK} strokeWidth="2.5" />
    <Rect x="20" y="20" width="9" height="9" rx="3" stroke={BLACK} strokeWidth="2.5" />
    <Circle cx="11.5" cy="11.5" r="1.8" fill={YELLOW} />
    <Circle cx="24.5" cy="24.5" r="1.8" fill={YELLOW} />
  </Svg>
);

