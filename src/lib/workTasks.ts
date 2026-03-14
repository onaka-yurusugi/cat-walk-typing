export interface WorkTask {
  label: string
  text: string
}

const TASK_POOL: WorkTask[] = [
  { label: 'メール返信', text: 'thanks for your email i will check the document today' },
  { label: 'Slack', text: 'the deploy is done lets check the staging server' },
  { label: 'レビュー', text: 'please fix the type error on line 47 before merging' },
  { label: '議事録', text: 'we agreed to launch the new feature next monday' },
  { label: 'バグ報告', text: 'the login page crashes on safari when using dark mode' },
  { label: '見積もり', text: 'this task should take about three days with testing' },
  { label: '進捗報告', text: 'we finished 8 out of 12 tasks in this sprint' },
  { label: 'リリース', text: 'version 3 includes a redesigned settings page' },
  { label: '障害対応', text: 'memory usage is spiking we need to restart the server' },
  { label: '企画書', text: 'the new search feature will improve conversion rates' },
  { label: 'メール', text: 'could you send me the meeting notes from yesterday' },
  { label: 'チャット', text: 'hey are you free for a quick call this afternoon' },
  { label: 'コード', text: 'we should refactor the auth module before adding oauth' },
  { label: 'ドキュメント', text: 'please update the api docs with the new endpoints' },
  { label: '日報', text: 'today i worked on the payment integration and wrote tests' },
  { label: 'レビュー', text: 'the pull request looks good but needs more test coverage' },
  { label: 'Slack', text: 'can someone check why the ci pipeline is failing again' },
  { label: 'メール', text: 'hi team the deadline has been moved to next friday' },
  { label: '障害', text: 'the cache layer is returning stale data clearing it now' },
  { label: '企画', text: 'users want a dark mode option lets add it to the backlog' },
  { label: '報告', text: 'customer satisfaction score went up by 5 points this month' },
  { label: 'チャット', text: 'the client meeting went well they approved the design' },
  { label: 'コード', text: 'i added input validation for the registration form' },
  { label: 'メール', text: 'please review the attached proposal by end of day' },
  { label: '日報', text: 'fixed three bugs and started on the new dashboard feature' },
  { label: 'Slack', text: 'fyi the staging environment will be down for maintenance' },
  { label: 'レビュー', text: 'nice work but please add error handling for edge cases' },
  { label: '報告', text: 'the migration script ran successfully on all databases' },
  { label: '企画', text: 'lets do a user survey to understand what people want most' },
  { label: 'チャット', text: 'lunch anyone the new ramen place looks really good' },
]

export function selectTasks(count: number): WorkTask[] {
  const shuffled = [...TASK_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export const TASK_COUNT = 10
export const GAME_DURATION = 120
