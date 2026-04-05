import type { ReactElement } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

interface BsTooltipProps {
  title: string;
  children: ReactElement;
}

export default function BsTooltip({ title, children }: BsTooltipProps) {
  return (
    <OverlayTrigger overlay={<Tooltip>{title}</Tooltip>}>
      {children}
    </OverlayTrigger>
  );
}
