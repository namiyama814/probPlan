const projectSection = document.getElementById("project-section");
const taskSection = document.getElementById("task-section");
const resultSection = document.getElementById("result-section");

projectSection.innerHTML = `
<h2 class="text-lg font-bold">プロジェクト</h2>
<p class="mt-2 text-sm text-[#252525]/60">
    プロジェクトを作成してください
</p>
`;

taskSection.innerHTML = `
<h2 class="text-lg font-bold">タスク一覧</h2>
`;

resultSection.innerHTML = `
<h2 class="text-lg font-bold">
    シミュレーション結果
</h2>
`;