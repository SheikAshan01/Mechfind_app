import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Rect,
  Circle,
  Path,
  Polygon,
  LinearGradient,
  Defs,
  Stop,
  G,
  Ellipse,
} from 'react-native-svg';

interface Props {
  width?: number | string;
  height?: number;
  isDark?: boolean;
}

/**
 * Professional Roadside Assistance Vector Illustration
 * Designed for MECHFIND: Sleek modern mobility SUV with roadside hazard warning cone,
 * clean alloy wheels, tinted aerodynamic glass, and subtle ground shadow.
 */
export const CarBreakdownIllustration: React.FC<Props> = ({
  height = 140,
  isDark = false,
}) => {
  return (
    <View style={[styles.container, { height }]}>
      <Svg
        width="100%"
        height={height}
        viewBox="0 0 380 150"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          {/* Subtle ambient road gradient */}
          <LinearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={isDark ? '#222328' : '#E5E6E9'} stopOpacity="0.8" />
            <Stop offset="1" stopColor={isDark ? '#101114' : '#F1F2F4'} stopOpacity="0" />
          </LinearGradient>

          {/* Car Body Metallic Gradient */}
          <LinearGradient id="carBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={isDark ? '#E5E6E9' : '#FFFFFF'} />
            <Stop offset="0.6" stopColor={isDark ? '#CBD5E1' : '#F1F2F4'} />
            <Stop offset="1" stopColor={isDark ? '#92959C' : '#E5E6E9'} />
          </LinearGradient>

          {/* Roof & Pillars */}
          <LinearGradient id="roofGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={isDark ? '#222328' : '#334155'} />
            <Stop offset="1" stopColor={isDark ? '#101114' : '#222328'} />
          </LinearGradient>

          {/* Window Glass Gradient */}
          <LinearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#C7C9CE" stopOpacity="0.75" />
            <Stop offset="0.4" stopColor="#70737B" stopOpacity="0.85" />
            <Stop offset="1" stopColor="#101114" stopOpacity="0.95" />
          </LinearGradient>

          {/* Wheel Tyre Gradient */}
          <LinearGradient id="tyreGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#334155" />
            <Stop offset="1" stopColor="#101114" />
          </LinearGradient>

          {/* Alloy Rim Gradient */}
          <LinearGradient id="rimGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F1F2F4" />
            <Stop offset="0.5" stopColor="#CBD5E1" />
            <Stop offset="1" stopColor="#70737B" />
          </LinearGradient>

          {/* Emergency Cone Gradient */}
          <LinearGradient id="coneGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FB923C" />
            <Stop offset="1" stopColor="#EA580C" />
          </LinearGradient>
        </Defs>

        {/* 1. Ground Surface & Shadow */}
        <Rect
          x="30"
          y="132"
          width="320"
          height="4"
          rx="2"
          fill="url(#groundGrad)"
        />
        {/* Soft Contact Shadow under tyres */}
        <Ellipse
          cx="195"
          cy="133"
          rx="105"
          ry="5"
          fill={isDark ? '#000000' : '#CBD5E1'}
          opacity={isDark ? 0.7 : 0.55}
        />

        {/* 2. Modern SUV / Crossover Vehicle Silhouette */}
        <G id="carGroup">
          {/* Wheel Arches & Underbody */}
          <Path
            d="M 90 128 L 115 128 C 115 116 126 106 138 106 C 150 106 161 116 161 128 L 225 128 C 225 116 236 106 248 106 C 260 106 271 116 271 128 L 295 128 C 298 128 300 125 300 122 L 300 114 C 300 108 296 103 290 101 L 275 97 L 245 80 C 238 76 230 74 220 74 L 165 74 C 155 74 146 78 140 85 L 118 97 L 98 100 C 93 101 90 105 90 110 Z"
            fill={isDark ? '#101114' : '#222328'}
            opacity="0.15"
          />

          {/* Car Main Body (Sculpted Modern Aerodynamic Paneling) */}
          <Path
            d="M 92 110 C 92 104 96 100 102 99 L 126 95 L 148 78 C 155 72 164 70 173 70 L 226 70 C 235 70 244 73 250 80 L 273 97 L 290 101 C 296 102 300 107 300 113 L 300 121 C 300 124 298 126 295 126 L 271 126 C 271 115 261 106 249 106 C 237 106 227 115 227 126 L 160 126 C 160 115 150 106 138 106 C 126 106 116 115 116 126 L 96 126 C 93 126 92 124 92 121 Z"
            fill="url(#carBodyGrad)"
            stroke={isDark ? '#475569' : '#CBD5E1'}
            strokeWidth="1.2"
          />

          {/* Subtle Side Character Crease Line */}
          <Path
            d="M 100 104 Q 190 98 294 104"
            stroke={isDark ? '#70737B' : '#92959C'}
            strokeWidth="1"
            fill="none"
            opacity="0.7"
          />

          {/* Roof Rails */}
          <Path
            d="M 168 67 L 234 67 C 236 67 238 68 238 70 L 164 70 C 164 68 166 67 168 67 Z"
            fill={isDark ? '#70737B' : '#92959C'}
          />

          {/* Window Frame & Glass Area */}
          <Path
            d="M 148 78 L 172 73 L 224 73 C 231 73 238 75 243 80 L 263 95 L 132 95 Z"
            fill="url(#glassGrad)"
            stroke={isDark ? '#222328' : '#475569'}
            strokeWidth="0.8"
          />

          {/* Center B-Pillar */}
          <Rect x="195" y="73" width="6" height="22" fill={isDark ? '#101114' : '#222328'} />

          {/* Front Quarter Glass Pillar */}
          <Path d="M 233 73 L 235 73 L 239 95 L 237 95 Z" fill={isDark ? '#101114' : '#222328'} />

          {/* Window Interior Glare / Reflection */}
          <Path
            d="M 174 74 L 186 74 L 176 94 L 164 94 Z"
            fill="#FFFFFF"
            opacity="0.18"
          />
          <Path
            d="M 205 74 L 217 74 L 227 94 L 215 94 Z"
            fill="#FFFFFF"
            opacity="0.15"
          />

          {/* Side Mirror */}
          <Path
            d="M 238 91 C 242 89 248 89 250 93 C 251 95 249 97 246 97 L 238 96 Z"
            fill="url(#carBodyGrad)"
            stroke={isDark ? '#475569' : '#92959C'}
            strokeWidth="0.8"
          />
          {/* Amber Indicator on Mirror */}
          <Rect x="242" y="93" width="5" height="1.8" rx="0.9" fill="#F59E0B" />

          {/* Front LED Projector Headlamp */}
          <Path
            d="M 288 103 L 298 104 C 299 105 300 107 298 109 L 286 109 Z"
            fill="#FFC400"
            opacity="0.9"
          />
          <Circle cx="294" cy="106" r="1.8" fill="#FFFFFF" />

          {/* Rear LED Wrap-Around Taillight */}
          <Path
            d="M 93 111 L 98 111 C 99 113 99 116 98 117 L 93 117 Z"
            fill="#EF4444"
          />

          {/* Rear Wheel (Left) */}
          <G id="rearWheel">
            <Circle cx="138" cy="125" r="15" fill="url(#tyreGrad)" />
            <Circle cx="138" cy="125" r="10" fill="url(#rimGrad)" />
            <Circle cx="138" cy="125" r="5" fill={isDark ? '#222328' : '#475569'} />
            {/* 5-Spoke Modern Rim Design */}
            <Rect x="136.5" y="116" width="3" height="18" rx="1.5" fill="#F1F2F4" />
            <Rect x="129" y="123.5" width="18" height="3" rx="1.5" fill="#F1F2F4" />
            <Circle cx="138" cy="125" r="2.2" fill="#101114" />
          </G>

          {/* Front Wheel (Right) */}
          <G id="frontWheel">
            <Circle cx="249" cy="125" r="15" fill="url(#tyreGrad)" />
            <Circle cx="249" cy="125" r="10" fill="url(#rimGrad)" />
            <Circle cx="249" cy="125" r="5" fill={isDark ? '#222328' : '#475569'} />
            {/* 5-Spoke Modern Rim Design */}
            <Rect x="247.5" y="116" width="3" height="18" rx="1.5" fill="#F1F2F4" />
            <Rect x="240" y="123.5" width="18" height="3" rx="1.5" fill="#F1F2F4" />
            <Circle cx="249" cy="125" r="2.2" fill="#101114" />
          </G>

          {/* Subtle MECHFIND Brand Badge on Door */}
          <Circle cx="180" cy="108" r="3.5" fill="#101114" opacity="0.85" />
          <Path d="M 178.5 108 L 181.5 108" stroke="#FFFFFF" strokeWidth="0.8" />
        </G>

        {/* 3. Roadside Assistance Emergency Traffic Hazard Cone */}
        <G id="hazardCone">
          {/* Cone Base */}
          <Rect
            x="312"
            y="131"
            width="26"
            height="4"
            rx="1.5"
            fill="#9A3412"
          />
          {/* Main Cone Body */}
          <Polygon
            points="325,103 314,131 336,131"
            fill="url(#coneGrad)"
          />
          {/* Reflective White Stripes */}
          <Polygon
            points="321.5,115 318,124 332,124 328.5,115"
            fill="#FFFFFF"
          />
          <Polygon
            points="323.5,108 322,112 328,112 326.5,108"
            fill="#FFFFFF"
          />
          {/* Cone Top Hole */}
          <Ellipse cx="325" cy="103" rx="1.5" ry="0.8" fill="#7C2D12" />

          {/* Emergency Alert Pulse Signal */}
          <Circle cx="325" cy="98" r="2" fill="#EA580C" />
          <Circle cx="325" cy="98" r="6" stroke="#FB923C" strokeWidth="1" strokeDasharray="2,2" fill="none" opacity="0.8" />
        </G>

        {/* 4. Service Assistance Indicator (Subtle Wrench / Shield) */}
        <G id="serviceIndicator" transform="translate(62, 70)">
          <Circle cx="12" cy="12" r="14" fill={isDark ? '#222328' : '#FFF3CC'} stroke="#101114" strokeWidth="1.5" />
          {/* Mini verified check */}
          <Path
            d="M 7 12 L 10.5 15.5 L 17 9"
            stroke="#16A34A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
