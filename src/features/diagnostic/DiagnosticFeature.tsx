import { useEffect, useState } from "react";
import { HomeScreen } from "../../components/HomeScreen";
import { DiagnosticShell } from "../../components/DiagnosticShell";
import { useDiagnostic } from "../../hooks/useDiagnostic";

export function DiagnosticFeature() {
  const {
    run,
    startNew,
    pause,
    resume,
    setModule,
    updateAnswers,
    revealHint,
    completeModule,
    resetAll,
  } = useDiagnostic();

  const [inSession, setInSession] = useState(false);

  useEffect(() => {
    if (run?.status === "active" && run.completedModuleIds.length > 0) {
      setInSession(true);
    }
  }, [run]);

  if (!run) {
    return (
      <HomeScreen
        hasRun={false}
        onStart={() => {
          startNew();
          setInSession(true);
        }}
        onResume={() => {}}
        onNewConfirm={() => {}}
      />
    );
  }

  if (!inSession) {
    return (
      <HomeScreen
        hasRun
        onStart={() => {
          startNew();
          setInSession(true);
        }}
        onResume={() => {
          resume();
          setInSession(true);
        }}
        onNewConfirm={() => {
          if (window.confirm("Delete current progress and start a new diagnostic?")) {
            resetAll();
            startNew();
            setInSession(true);
          }
        }}
      />
    );
  }

  return (
    <DiagnosticShell
      run={run}
      onPatch={updateAnswers}
      onRevealHint={revealHint}
      onCompleteModule={completeModule}
      onSelectModule={setModule}
      onPause={pause}
      onResume={resume}
    />
  );
}
