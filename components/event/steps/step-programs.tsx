'use client'

import ProgramsEditor from '@/components/event/programs-editor'
import type { ProgramItem } from '@/types'

interface StepProgramsState {
  programs: ProgramItem[]
}

interface Props {
  state: StepProgramsState
  update: (partial: Partial<StepProgramsState>) => void
}

export default function StepPrograms({ state, update }: Props) {
  return (
    <div className="space-y-5">
      <ProgramsEditor
        items={state.programs}
        onChange={(programs) => update({ programs })}
      />
    </div>
  )
}
