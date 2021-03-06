describe('sorting', function () {
  it('should allow sorting an array', function () {
    let a = decal.Array.create(3, 2, 6, 1, 5, 4)
    a.sort()

    expect(a.toArray()).to.deep.equal([1, 2, 3, 4, 5, 6])

    a.destroy()
  })

  it('should allow sorting an array with a function', function () {
    let a = decal.Array.create(
      {val: 5},
      {val: 3},
      {val: 1},
      {val: 4},
      {val: 2}
    )

    a.sort(function (a, b) {
      if (a.val > b.val) return -1
      else if (a.val < b.val) return 1
      return 0
    })

    expect(a.toArray()).to.deep.equal([
      {val: 5},
      {val: 4},
      {val: 3},
      {val: 2},
      {val: 1}
    ])

    a.destroy()
  })

  it('should allow reversing an array', function () {
    let a = decal.Array.create(5, 4, 3, 2, 1)
    expect(a.toArray()).to.deep.equal([5, 4, 3, 2, 1])

    a.reverse()
    expect(a.toArray()).to.deep.equal([1, 2, 3, 4, 5])

    a.reverse()
    expect(a.toArray()).to.deep.equal([5, 4, 3, 2, 1])

    a.destroy()
  })
})
