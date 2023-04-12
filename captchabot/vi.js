module.exports = {
  interactionCreate: {
    errorCmd:
      "Command \`<command>\` không tim thấy. Vui lòng vào [support server](https://discord.gg/y97MvVyrwC) để báo lỗi nhé!",
    onCooldown:
      "Này <user>, vui lòng đợi thêm **<duration>** nữa để sử dụng lại lệnh!",
    permissionError:
      "Tui không có quyền `Administrator` để sử dụng bất kỳ command nào của tui",
  },
  verify: {
    verifyCmd: {
      permissionError: "❌ | Bạn cần quyền `Administrator` để sử dụng lệnh này",
      errorChannel:
        "Đã xảy ra lỗi khi gửi panel đến channel! Vui lòng thử lại sau..",
      successSend: "Verification channel đã được thiết lập thành công!",
      noData: "Server này chưa tạo verification panel!",
      successDetele: "Xóa thành công dữ liệu cho **<server>**",
      isData: "Server này đã tạo verification panel rồi!",
    },
    interaction: {
      noData: "Server này chưa được setup!",
      hasRole: "Bạn đã được verify rồi!",
      checkVerify: "Check tin nhắn tui vừa gửi cho bạn nhé!",
      permissionError:
        "Tui không có quyền `Administrator` để sử dụng bất kỳ command nào của tui",
      embedTitle: "Vui lòng verify để có quyền nhắn ở <server>",
      embedDescription:
        "Vui lòng gửi mã code trong DM này\n\n**NOTE:** Captcha này là CaSe SenSiTivE và không bao gồm dấu cách",
      embedFooter: "Bạn có 60 giây để giải captcha",
      outTime:
        "Bạn đã bị kick ra khỏi **<server>** vì mất quá nhiều thời gian để giải captcha!",
      failedSolve:
        "Bạn đã bị kick ra khỏi **<server>** bởi vì bạn đã giải sai captcha. Bạn có thể thử lại bằng cách join lại server!",
      successVerify:
        "Bạn đã thành công verify trong **<server>**\n\nVote cho tui: https://top.gg/bot/909386183107305504/vote",
    },
  },
};
