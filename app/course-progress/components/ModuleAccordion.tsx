import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const ModuleAccordion = ({ title }) => {
  return (
    <AccordionItem value={title}>
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent>
        {/* Placeholder for module content */}
        <p className="text-sm text-gray-600">Module content goes here...</p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ModuleAccordion;
