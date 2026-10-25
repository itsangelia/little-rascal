# Little Rascal — 演讲稿重写版

954 English words; planned 9:25, including 120-second edited demonstration.

## 01 — Little Rascal

Hello, this is Little Rascal, a p5.js virtual pet game. Players name a pet and care for it through childhood, youth and old age. I want them to feel connected to their pet and responsible for its life. The game follows a cycle from one egg to the next.

大家好，这是 Little Rascal，一个用 p5.js 制作的虚拟宠物游戏。玩家起名，照顾小球经历幼年、青年和老年。我希望他们和自己的小球建立情感连接，对它的生命产生责任感。游戏从一颗蛋开始，循环到下一颗蛋。

备注（不读）：

## 02 — Giving it a name

A gently rocking egg invites the first click. A shooting star crosses the room, and the pet appears. Then the player names it. Naming makes the player feel, “This is my pet.” It starts the emotional connection and the responsibility to look after it. The original arrival was too quick, so I extended it to give players time to see the pet before naming it.

蛋轻轻晃动，暗示玩家点击。流星划过房间，小球出现，然后玩家起名。起名是为了让玩家觉得“这是我的小球”，开始建立情感连接和照顾它的责任感。原来的出场太快，所以我延长了动画，让玩家起名前有时间看清小球。

备注（不读）：拟定展览形式：电脑、鼠标及耳机。此处不声称已经举办展览。演示保留点击蛋、流星、角色出现和实际输入名字。

## 03 — How the game works

Here is a short recording of the game. The player can feed the pet, stroke it, throw its toy, clean the room and let it sleep. I have cut between stages to show the full life cycle. Watch how its reactions change as it grows. At the end, the player opens the letter, and a new egg appears.

接下来是一段简短的游戏录屏。玩家可以喂食、摸摸、扔玩具、清理房间和让小球睡觉。我剪接了不同阶段，展示完整的生命周期。可以留意小球成长后回应的变化。最后，玩家打开信，新的蛋出现。

备注（不读）：本页预留120秒实际录屏；这段口播包含在120秒内。00:00–00:25 蛋/流星/起名；00:25–00:55 喂食/摸摸/拖球与接触后踢球；00:55–01:20 青年表情与拒绝；01:20–02:00 老年休息/要摸摸/自然告别/点信封/新蛋。阶段间清楚剪接，不能称为两分钟连续养完整一生。视频尚未嵌入。

## 04 — What I wanted the player to feel

Norman’s three levels help explain these choices. Visceral design is the first impression: the soft room and the pet’s appearance invite the player closer. Behavioural design is the response to feeding, touching and playing. Reflective design is the meaning of that care. Giving the pet a name makes it personal; watching it age and reading its final letter bring the player back to the life they have looked after.

诺曼的三个层次帮助解释这些选择。本能层面是第一印象：柔和的房间与小球外形吸引玩家接近。行为层面是喂食、摸摸和玩耍得到的回应。反思层面是照顾的意义：起名让它成为自己的小球；看到它变老、读到最后的信，让玩家回顾自己照顾过的这段生命。

备注（不读）：理论引用：Norman (2004)。描述设计目标，不写成已经测得的玩家情感。

## 05 — Three stages, three different responses

I reduced four stages to three to shorten the experience, combining the middle stages into Youth. The little one needs feeding, petting and rest. Youth becomes mischievous and sometimes refuses care. The senior slows down and becomes more attached to the player. Growth depends on care: the little one needs three useful feeding or petting interactions in total, then its next sleep. Looking after it lets the player take part in its growth.

为了缩短体验，我把中间阶段合并成青年，从四阶段减为三阶段。幼年需要喂食、摸摸和休息；青年更调皮，有时拒绝照顾；老年行动变慢，更依恋玩家。成长和照顾有关：幼年把喂食和摸摸合起来累计三次有效互动，再睡醒才长大。玩家通过照顾参与它的成长。

备注（不读）：实际顺序child→adult→elder，界面显示Little One/Youth/Senior。青年仍为两次有效喂食＋两次其他照顾后睡醒。计数达标不会立即变形。四减三是已经实施的时长优化。 幼年是喂食或摸摸合计三次，不是各三次；任意组合均可。三次喂食、三次摸摸或混合组合皆已浏览器验证。

## 06 — Making the toy something to play with

Playing started as a button. I put a toy in the room so the player could pick it up and throw it. The early chase looked disconnected, and the pet moved too fast. I changed this to a slower approach and a small kick at contact. The toy moves when the pet touches it, with a short call on the kick. This makes the interaction easier to follow.

最初，玩耍是一个按钮。我把玩具放进房间，让玩家可以拿起并扔出去。早期追球像是碰不到球，移动也太快。我改成慢一点接近，接触时轻轻踢出去。碰到时玩具才移动，踢中还有短叫声，让互动更容易看懂。

备注（不读）：前后对比来自作者在本对话的具体反馈。图片展示当前游戏，不伪造早期截图。保留玩家扔球、宠物接近和接触动作同框。

## 07 — Youth has a temper

I made Youth more mischievous. It has a twenty-five percent baseline chance of refusing food, petting or play. It may jump away from a touch or angrily kick the toy away. Repetition or a full need can make it look unimpressed and stay still. I want the player to notice these reactions and adjust their care. Its face and movements show when it is happy, annoyed or unwilling to play.

我把青年设计得更调皮。它对喂食、摸摸和玩耍有百分之二十五的基础拒绝概率。它会躲开摸摸，或者生气地踢走玩具。重复操作或需求已满时，会无语、站着不动。我希望玩家留意这些反应，调整照顾方式。表情和动作表现它是高兴、厌烦，还是不想玩。

备注（不读）：满值、重复操作及危急安抚有优先级，所以25%是基础随机概率。低心情时摸摸保留安抚通道。无语与愤怒各扣一次心情，不把拒绝描述为没有后果。

## 08 — Older and more attached to the player

The senior becomes slower and more attached to the player. It asks to be petted through a thought bubble. Youth sometimes refuses attention; the senior actively asks for it. Getting the movement right took several revisions. Slowing everything looked like slow motion, and walking did not suit it. I kept three small, slower hops followed by about three seconds of rest. It still looks like the same pet, but older.

老年行动变慢，也更依恋玩家，会通过气泡请求摸摸。青年有时拒绝关注，老年却主动要陪伴。动作改了几次：整体放慢像慢放，贴地走又不适合它。我保留连续三次缓慢的小跳，再休息约三秒。它还是原来的小球，只是变老了。

备注（不读）：老年主动要摸摸气泡在自然离世前出现三次，忙碌时会推迟。老年不主动发起玩球；仍可回应玩家扔球。

## 09 — Showing how the pet feels

My tutor suggested clearer visual feedback for needs and more sound. The hungry pose already helped: below thirty hunger, the pet becomes flattened and weak. The player can see that it needs food. I kept this and added recorded calls for petting, anger, crying, kicking and occasional humming. I recorded the voice myself. Crying plays once when it begins. Together, the face, body and voice give the player more ways to notice how the pet is feeling.

老师建议把状态表现得更直观，并补充声音。原有的饿扁形态已经有这个作用：饥饿数值低于三十，小球会变扁、没精神，玩家能看出它需要吃东西。我保留这个表现，并加入摸摸、生气、哭泣、踢球和自然哼哼的叫声。声音是我自己录制的；哭声只在开始哭泣时播放一次。表情、身体和声音一起帮助玩家留意它的状态。

备注（不读）：气泡目前用于老年请求摸摸，不把老师建议写成“所有需求已改为气泡”。音乐按钮只关闭背景音乐。

## 10 — Why the pet can die

I added death to give the player a stronger sense of responsibility and challenge. Feeding, comfort and cleaning affect whether the pet survives. Leaving it hungry, unhappy or in a dirty room can have consequences, so the player needs to keep paying attention. Natural old age is different: even with good care, its life eventually ends. I kept these endings separate. Neglect leads to the death result screen; the natural ending leads to the farewell and thank-you letter.

加入死亡，是为了增加玩家的责任感和挑战性。喂食、安抚和清理会影响小球能否活下来。让它挨饿、不开心，或不清理房间，都会有后果，所以玩家需要持续关注。自然老死则不同：即使照顾得好，生命也会结束。我保留了两种不同的结尾：照顾不周进入死亡结算，自然老死进入告别与感谢信。

备注（不读）：实际规则只留在备注：饥饿或心情为0持续8秒；每个粑粑6秒发臭，产生13秒后可病死。老年通常累计80秒可见活跃时间后自然离世，可被忙碌/气泡推迟。口播不堆时间参数。

## 11 — Goodbye, then a new egg

In the natural ending, the pet stops, softens slightly and slowly disappears. Its soul rises into stars, leaving an envelope on the floor. I changed the automatic letter popup into a clickable envelope, so players choose when to read its thanks. After they close it, starlight gathers into a new egg. This completes the cycle of birth, growth, death and new life. Another pet is ready to be named and cared for.

自然结尾中，小球停住，身体轻微软下来，慢慢消散。灵魂升起化为星星，地上留下信封。我把自动弹出的信改成点击信封再打开，让玩家自己决定什么时候读它的感谢。关闭后，星光汇成新蛋，完成出生、成长、死亡与新生的循环。新的小球等待起名和照顾。

备注（不读）：不声称新蛋保存上一世名字、存档或记忆。感谢信原文保持作者提供版本；不在信上增加死因。

## 12 — What feedback changed

Classmates suggested background music, better toy interaction and more expressions, including the hungry pose. My tutor suggested sound effects and clearer needs. My playthroughs helped adjust the chase, senior rest and opening length. These changes made the pet more expressive and gave the player more to do. I also learned to check the whole action: changing a face alone did not fix awkward movement.

同学建议加入背景音乐、增强玩具互动、丰富表情，包括饿扁形态。老师建议补充音效和更清楚的状态表现。自己的试玩帮助我调整追球、老年休息和开场长度。这些修改让小球更有表现力，也增加了可玩的内容。我还发现需要看完整动作：只换表情，不能解决奇怪的移动。

备注（不读）：根据作者回忆的同学建议、转述的老师意见和已有开发记录，不增添人数、日期、引语或正式研究结果。brief要求给同学的建设性反馈仍需作者提供真实例子。

## 13 — What works, and what I would improve

The strongest part is how care changes across the pet’s life. Petting a mischievous young pet and comforting an older one use the same control, but are meant to feel different. Next, I would watch new players to see whether they discover the toy and understand danger signs in time. I want clearer cues while keeping the challenge. I would also check whether the shortened three-stage experience fits an exhibition visit.

我认为最有力的是，照顾在不同阶段有了变化。摸摸调皮的青年和陪伴老年，用的是同一个操作，我希望感受不同。下一步，我会观察新玩家能否发现玩具、及时理解危险提示。我想让提示更清楚，同时保留挑战，也验证缩短后的三阶段是否适合展览体验。

备注（不读）：这是基于当前作品的分析与下一步计划，不声称已完成独立观众研究。拟定展览为单人电脑交互；当前不是多人装置。

## 14 — From one egg to the next

Little Rascal begins with naming a pet and choosing to look after it. As it grows, the player meets its playful side, its temper and its need for company. Death gives that care a consequence, and the new egg brings the life cycle back to the beginning. I want players to feel connected to their own little pet and responsible for the life they are looking after. Thank you.

Little Rascal 从起名和照顾开始。小球成长时，玩家会遇见它调皮的一面、它的脾气，以及它对陪伴的需要。死亡让照顾有了后果，新的蛋则让生命循环回到起点。我希望玩家和自己的小球建立情感连接，也对正在照顾的生命产生责任感。谢谢。

备注（不读）：

## 15 — How the movement works





备注（不读）：补充说明，不占正文口播。p5.js二维绘制；地面坐标与跳跃高度分离；影子贴地；按地面Y排序。球与宠物的接触检测单独决定踢球。内部900×640，CSS仅适配显示。避免把坐标分离误说成足以实现接触检测。

## 16 — References & source notes





备注（不读）：引用采用作者—年份草稿，最终按unit outline规定格式统一。老师已许可AI辅助（作者确认）。叫声为作者本人录制（作者确认）。BGM平台Pixabay（作者原写pixaboy），具体曲名/作者/下载链接待补。参考游戏发布信息仍待核实。

## 17 — AI assistance & submission record





备注（不读）：作者确认已获老师许可使用AI辅助，叫声音频由本人录制，BGM来源为pixaboy（按Pixabay理解）。声明仍需作者核实实际范围并按课程规定签署；不得把这一确认写成助手独立验证的许可证。音乐曲名、作者及具体链接还未提供。brief要求反思自己给同学的反馈，目前未提供具体例子。
