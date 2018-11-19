using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ranking_showcase.Models;

namespace ranking_showcase.Controllers
{
    [Route("api/[controller]")]
    public class AnimeController : Controller
    {
        private RankingMgr rankingMgr;
        public AnimeController(RankingMgr rankingMgr) {
            this.rankingMgr = rankingMgr;
        }

        // Should match /api/anime/list, /api/anime/list?start=20&length=20
        [HttpGet("list")]
        public IActionResult ReadAll()
        {
            try{
                int start = String.IsNullOrEmpty(Request.Query["start"]) ? 0 : Convert.ToInt32(Request.Query["start"]);
                int len = String.IsNullOrEmpty(Request.Query["length"]) ? 100000 : Convert.ToInt32(Request.Query["length"]);
                return Json(rankingMgr.readAll(start, len));
            } catch (Exception e) {
                return BadRequest(e.Message);
            }
            
        }

        // Should match /api/anime/id/x
        [HttpGet("id/{id}")]
        public IActionResult ReadById(int id) {
            try {
                return Json(rankingMgr.readById(id));
            } catch (Exception e) {
                return BadRequest(e.Message);
            }
        }

        // Should match /api/anime/rank/5, /api/anime/rank/5?source=original
        [HttpGet("rank/{rank}")]
        public IActionResult ReadByRank(int rank) {
            try {
                string source = Request.Query["source"];
                if (source == "original") {
                    return Json(rankingMgr.readByBgmrank(rank));
                }
                else {
                    return Json(rankingMgr.readByRank(rank));
                }
            } catch (Exception e) {
                return BadRequest(e.Message);
            }
        }

        [HttpGet("search")]
        public IActionResult Search() {
            try {
                string q = Request.Query["q"];
                if (!string.IsNullOrEmpty(q)) {
                    return Json(rankingMgr.searchByName(q));
                }else {
                    return Json(new List<RankingItm>{});
                }
            } catch (Exception e) {
                return BadRequest(e.Message);
            }
        }
    }
}
