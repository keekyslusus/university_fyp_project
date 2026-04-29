interface MessagePanelProps {
  message: string;
}

export function MessagePanel(props: MessagePanelProps) {
  return (
    <section class="messagePanel errorPanel">
      <span class="material-symbols-rounded" aria-hidden="true">error</span>
      <p>{props.message}</p>
    </section>
  );
}
