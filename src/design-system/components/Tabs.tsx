import { type ReactNode, useState, useId } from 'react';
import { BaseTabs, BaseTabsList, BaseTabsTrigger, BaseTabsContent } from '@/design-system/primitives/tabs';
import { tabsListVariants, tabsTriggerVariants } from '@/design-system/variants/tabs';
import { cn } from '@/design-system/utils/cn';

export interface TabDefinition {
  value: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabDefinition[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function Tabs({
  tabs,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
}: TabsProps): ReactNode {
  const baseId = useId();
  const [internalValue, setInternalValue] = useState(
    defaultValue || tabs[0]?.value || '',
  );

  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : internalValue;

  function handleTabChange(tabValue: string) {
    if (!isControlled) {
      setInternalValue(tabValue);
    }
    onValueChange?.(tabValue);
  }

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const currentEnabledIndex = enabledTabs.findIndex((t) => t.value === tabs[index]?.value);

    let newIndex = -1;
    if (e.key === 'ArrowRight') {
      newIndex = (currentEnabledIndex + 1) % enabledTabs.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (currentEnabledIndex - 1 + enabledTabs.length) % enabledTabs.length;
    }

    if (newIndex >= 0) {
      e.preventDefault();
      const newTab = enabledTabs[newIndex];
      if (newTab) {
        handleTabChange(newTab.value);
        const triggerId = `${baseId}-trigger-${newTab.value}`;
        document.getElementById(triggerId)?.focus();
      }
    }
  }

  return (
    <BaseTabs className={className}>
      <BaseTabsList className={cn(tabsListVariants())}>
        {tabs.map((tab, index) => {
          const triggerId = `${baseId}-trigger-${tab.value}`;
          const panelId = `${baseId}-panel-${tab.value}`;
          const isActive = activeValue === tab.value;

          return (
            <BaseTabsTrigger
              key={tab.value}
              id={triggerId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => handleTabChange(tab.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                tabsTriggerVariants({ state: isActive ? 'active' : 'inactive' }),
              )}
            >
              {tab.label}
            </BaseTabsTrigger>
          );
        })}
      </BaseTabsList>
      {tabs.map((tab) => {
        const triggerId = `${baseId}-trigger-${tab.value}`;
        const panelId = `${baseId}-panel-${tab.value}`;
        const isActive = activeValue === tab.value;

        return (
          <BaseTabsContent
            key={tab.value}
            id={panelId}
            role="tabpanel"
            aria-labelledby={triggerId}
            hidden={!isActive}
            tabIndex={0}
            className="mt-2"
          >
            {isActive && tab.content}
          </BaseTabsContent>
        );
      })}
    </BaseTabs>
  );
}
