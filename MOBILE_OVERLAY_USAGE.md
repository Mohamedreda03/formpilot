# 📱 Mobile Overlay Component

مكون بسيط لإخفاء الصفحات المعقدة على الشاشات الصغيرة مع رسالة باللغة الإنجليزية.

## 🎯 الاستخدام الأساسي

```tsx
import { MobileOverlay } from "@/components/ui/mobile-overlay";

export default function ComplexPage() {
  return (
    <>
      {/* Mobile Overlay */}
      <MobileOverlay />

      {/* Main Content - Hidden on Mobile */}
      <div className="hidden lg:flex">
        {/* Your complex desktop content here */}
      </div>
    </>
  );
}
```

## ⚙️ الخصائص المتاحة

```tsx
interface MobileOverlayProps {
  message?: string; // الرسالة المخصصة (بالإنجليزية)
  workspaceId?: string; // معرف workspace للعودة إليه
  onBack?: () => void; // دالة مخصصة للعودة
}
```

## 📝 أمثلة الاستخدام

### 1. استخدام افتراضي (بسيط)

```tsx
<MobileOverlay />
```

### 2. رسالة مخصصة

```tsx
<MobileOverlay message="This advanced editor requires a larger screen to function properly." />
```

### 3. العودة لـ workspace محدد

```tsx
<MobileOverlay workspaceId="workspace-123" />
```

### 4. دالة عودة مخصصة

```tsx
<MobileOverlay onBack={() => router.push("/dashboard")} />
```

## 🎨 التصميم

- **بساطة تامة**: نص واحد + زر واحد فقط
- **بدون أيقونات**: لا توجد أيقونات أو عناصر بصرية إضافية
- **نص إنجليزي**: جميع النصوص باللغة الإنجليزية
- **زر العودة**: يعود إلى صفحة workspace أو الصفحة المحددة

## 📱 السلوك الافتراضي

### أولوية العودة:

1. إذا تم تمرير `onBack` - يستخدم الدالة المخصصة
2. إذا تم تمرير `workspaceId` - يعود إلى `/ws/[workspaceId]`
3. افتراضياً - يعود إلى `/ws`

### الرسالة الافتراضية:

```
"This page is designed for desktop use. Please use a laptop or desktop computer for the best experience."
```

## 🚀 أمثلة عملية

### Form Editor

```tsx
// في صفحة form/[formId]
<MobileOverlay />
```

### Workspace-specific Page

```tsx
// في صفحة تابعة لـ workspace محدد
<MobileOverlay workspaceId={workspaceId} />
```

### Admin Dashboard

```tsx
<MobileOverlay
  message="Admin dashboard requires desktop access."
  onBack={() => router.push("/admin")}
/>
```

## 📱 نقاط التوقف

- **< 1024px**: يظهر الـ overlay
- **≥ 1024px**: يخفي الـ overlay ويظهر المحتوى

## ✨ المزايا الجديدة

- ✅ **بساطة تامة** - لا توجد عناصر غير ضرورية
- ✅ **نص إنجليزي** - مناسب للجمهور الدولي
- ✅ **بدون أيقونات** - تركيز على الرسالة فقط
- ✅ **عودة ذكية** - يعود لأفضل صفحة مناسبة
- ✅ **حجم صغير** - كود أقل وأداء أفضل
