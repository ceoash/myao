interface ContainerProps {
    children: React.ReactNode;
    isFlexGrow?: boolean;
}


const Container = ({ children, isFlexGrow }: ContainerProps) => {
  return (
    <div className={`container 
        mx-auto 
        overflow-y-auto 
        scrollbar-thumb-orange 
        scrollbar-thumb-rounded 
        scrollbar-track-orange-lighter 
        scrollbar-w-2 
        scrolling-touch 
        ${isFlexGrow ? 'flex-grow' : ''}`}>
      {children}
    </div>
  );
};

export default Container;



