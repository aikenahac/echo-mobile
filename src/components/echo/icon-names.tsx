import { useColors } from "@/lib/theme";
import {
  ArrowUpRight,
  BadgeCheck,
  Book,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Database,
  Ellipsis,
  Eye,
  EyeOff,
  Flag,
  Folder,
  Globe,
  Hand,
  Heart,
  ImagePlus,
  LayoutGrid,
  List,
  Lock,
  MailOpen,
  Minus,
  Pencil,
  Plus,
  Search,
  Settings,
  Sparkle,
  Sparkles,
  Star,
  Trash2,
  UserPlus,
  X,
  type LucideIcon,
} from "lucide-react-native";
import type { ComponentType } from "react";
import Svg, { Circle as SvgCircle, Path } from "react-native-svg";

export type IconRendererProps = { size: number; color: string; strokeWidth: number };
type IconRenderer = ComponentType<IconRendererProps>;

/** A Lucide icon drawn as an SF Symbol stand-in; `filled` paints the shape (the `.fill` symbols) */
function lucide(Icon: LucideIcon, filled = false): IconRenderer {
  function LucideSymbol({ size, color, strokeWidth }: IconRendererProps) {
    return <Icon size={size} color={color} strokeWidth={strokeWidth} fill={filled ? color : "none"} />;
  }
  LucideSymbol.displayName = `Lucide(${Icon.displayName ?? "Icon"})`;
  return LucideSymbol;
}

/** checkmark.circle.fill: a solid disc with the check cut out in paper */
function CheckCircleFill({ size, color, strokeWidth }: IconRendererProps) {
  const colors = useColors();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <SvgCircle cx={12} cy={12} r={11} fill={color} />
      <Path d="M7.5 12.5l3 3 6-6.5" stroke={colors.paper} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

/** Lucide has no brand marks; Apple's logo for Sign in with Apple */
function AppleLogo({ size, color }: IconRendererProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M16.37 12.62c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-2.99-.79-1.54.02-2.96.9-3.75 2.27-1.6 2.78-.41 6.89 1.15 9.14.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.51 1.25-2.58-.03-.01-2.39-.92-2.4-3.66zM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.01.61-2.66 1.37-.58.67-1.09 1.76-.96 2.8 1.02.08 2.05-.52 2.68-1.28z"
      />
    </Svg>
  );
}

/**
 * Every symbol the app draws, keyed by its SF Symbol name. iOS renders the SF Symbol;
 * Android (which has no SF Symbols) renders the Lucide stand-in. A name missing here is
 * a type error, so a new icon can't silently vanish on Android.
 */
export const ICONS = {
  "apple.logo": AppleLogo,
  "arrow.up.right": lucide(ArrowUpRight),
  book: lucide(Book),
  bookmark: lucide(Bookmark),
  checkmark: lucide(Check),
  "checkmark.circle.fill": CheckCircleFill,
  "checkmark.seal": lucide(BadgeCheck),
  "chevron.down": lucide(ChevronDown),
  "chevron.right": lucide(ChevronRight),
  circle: lucide(Circle),
  cylinder: lucide(Database),
  ellipsis: lucide(Ellipsis),
  "envelope.open": lucide(MailOpen),
  eye: lucide(Eye),
  "eye.slash": lucide(EyeOff),
  flag: lucide(Flag),
  folder: lucide(Folder),
  gearshape: lucide(Settings),
  globe: lucide(Globe),
  "hand.raised": lucide(Hand),
  heart: lucide(Heart),
  "heart.fill": lucide(Heart, true),
  "list.bullet": lucide(List),
  lock: lucide(Lock),
  magnifyingglass: lucide(Search),
  minus: lucide(Minus),
  pencil: lucide(Pencil),
  "person.badge.plus": lucide(UserPlus),
  photo: lucide(ImagePlus),
  plus: lucide(Plus),
  sparkle: lucide(Sparkle),
  sparkles: lucide(Sparkles),
  "square.grid.2x2": lucide(LayoutGrid),
  star: lucide(Star),
  "star.fill": lucide(Star, true),
  trash: lucide(Trash2),
  xmark: lucide(X),
} satisfies Record<string, IconRenderer>;

export type IconName = keyof typeof ICONS;
