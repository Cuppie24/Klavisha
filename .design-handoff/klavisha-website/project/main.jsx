// main.jsx — mounts the Klavisha catalog directions onto the design canvas
function App() {
  return (
    <DesignCanvas>
      <DCSection id="catalog" title="Klavisha · Catalogue" subtitle="Three directions — hearts toggle, header counter & category filters are live">
        <DCArtboard id="a" label="A · Neon Terminal" width={1148} height={1012}>
          <DirectionTerminal />
        </DCArtboard>
        <DCArtboard id="b" label="B · Editorial Dark" width={1168} height={1492}>
          <DirectionEditorial />
        </DCArtboard>
        <DCArtboard id="c" label="C · Soft Light" width={1148} height={1040}>
          <DirectionLight />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
